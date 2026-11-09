import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { AuthProvider, useAuth } from "@/components/lunova/AuthProvider";
import { getProject, getSession, saveProject, setSession, type Project } from "@/lib/lunova-store";

const mocks = vi.hoisted(() => ({
  auth: { name: "test-auth", currentUser: undefined as User | null | undefined },
  getFirebaseAuth: vi.fn(),
  observe: vi.fn(),
  unsubscribe: vi.fn(),
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  loginWithGitHub: vi.fn(),
  registerWithEmail: vi.fn(),
  logoutFirebase: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

vi.mock("firebase/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("firebase/auth")>()),
  onAuthStateChanged: mocks.observe,
}));
vi.mock("@/lib/firebase-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/firebase-auth")>()),
  getFirebaseAuth: mocks.getFirebaseAuth,
  loginWithEmail: mocks.loginWithEmail,
  loginWithGoogle: mocks.loginWithGoogle,
  loginWithGitHub: mocks.loginWithGitHub,
  registerWithEmail: mocks.registerWithEmail,
  logoutFirebase: mocks.logoutFirebase,
  requestPasswordReset: mocks.requestPasswordReset,
}));

let nextUser: (user: User | null) => void;
let observerError: (error: unknown) => void;
let currentAuth: ReturnType<typeof useAuth>;

const user = (uid: string): User =>
  ({
    uid,
    email: `${uid}@example.com`,
    displayName: uid,
    emailVerified: true,
    providerData: [{ providerId: "password" }],
  }) as User;

function Probe() {
  const auth = useAuth();
  currentAuth = auth;
  // Simulates an editor that loads local state only on mount.
  const [draft] = useState(() => getProject("shared-id")?.name || "No draft");
  return (
    <>
      <p data-testid="identity">
        {auth.loading ? "Restoring" : auth.session?.uid || auth.session?.mode || "Signed out"}
      </p>
      <p data-testid="draft">{draft}</p>
      {auth.error && <p role="alert">{auth.error}</p>}
    </>
  );
}

const mount = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
const publish = async (value: User | null) =>
  act(async () => {
    nextUser(value);
  });
const project = (name: string): Project => ({
  id: "shared-id",
  name,
  kind: "website",
  files: {},
  messages: [],
  updatedAt: 1,
  accent: "blue",
});

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  setSession(null);
  mocks.auth.currentUser = undefined;
  mocks.getFirebaseAuth.mockReturnValue(mocks.auth);
  mocks.logoutFirebase.mockResolvedValue(undefined);
  mocks.observe.mockImplementation((_auth, next, error) => {
    nextUser = next;
    observerError = error;
    return mocks.unsubscribe;
  });
});
afterEach(() => {
  cleanup();
  setSession(null);
});

describe("Firebase session observer", () => {
  it("waits for Firebase instead of trusting a persisted demo identity, then restores the real UID", async () => {
    localStorage.setItem(
      "lunova.session",
      JSON.stringify({ uid: "forged", name: "Fake", email: "fake@example.com", mode: "firebase" }),
    );
    mount();
    expect(screen.getByTestId("identity")).toHaveTextContent("Restoring");
    expect(getSession()).toBeNull();
    await publish(user("account-a"));
    expect(screen.getByTestId("identity")).toHaveTextContent("account-a");
    expect(getSession()).toMatchObject({ uid: "account-a", mode: "firebase" });
  });

  it("preserves the current account when Firebase rejects sign-out", async () => {
    mount();
    await publish(user("account-a"));
    const failure = { code: "auth/network-request-failed" };
    mocks.logoutFirebase.mockRejectedValue(failure);
    await act(async () => {
      await expect(currentAuth.signOut()).rejects.toBe(failure);
    });
    expect(screen.getByTestId("identity")).toHaveTextContent("account-a");
    expect(getSession()?.uid).toBe("account-a");
  });

  it("clears the account only after successful Firebase sign-out", async () => {
    mount();
    await publish(user("account-a"));
    await act(async () => {
      await currentAuth.signOut();
    });
    expect(mocks.logoutFirebase).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("identity")).toHaveTextContent("Signed out");
    expect(getSession()).toBeNull();
  });

  it("signs out the real account before publishing guest access, and restores guest exploration on reload", async () => {
    const view = mount();
    await publish(user("account-a"));
    await act(async () => {
      await currentAuth.continueAsGuest();
    });
    expect(mocks.logoutFirebase).toHaveBeenCalledTimes(1);
    expect(getSession()?.mode).toBe("guest");
    view.unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    setSession(null);
    mount();
    await publish(null);
    expect(screen.getByTestId("identity")).toHaveTextContent("guest");
  });

  it("remounts account-local editor state when another tab changes the Firebase user", async () => {
    setSession({ name: "A", email: "a@example.com", uid: "account-a", mode: "firebase" });
    saveProject(project("Account A draft"));
    setSession({ name: "B", email: "b@example.com", uid: "account-b", mode: "firebase" });
    saveProject(project("Account B draft"));
    setSession(null);
    mount();
    await publish(user("account-a"));
    expect(screen.getByTestId("draft")).toHaveTextContent("Account A draft");
    await publish(user("account-b"));
    expect(screen.getByTestId("draft")).toHaveTextContent("Account B draft");
    expect(getSession()?.uid).toBe("account-b");
  });

  it("clears identity and exposes a safe error when initial restoration fails", async () => {
    mount();
    await act(async () => {
      observerError({ code: "auth/network-request-failed", message: "Private backend details" });
    });
    expect(screen.getByTestId("identity")).toHaveTextContent("Signed out");
    expect(getSession()).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent(/internet connection/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent("Private backend details");
  });

  it.each(["google", "github", "signup"] as const)(
    "does not replace a newer observed account when an older %s request finishes",
    async (method) => {
      const accountA = user("account-a");
      const accountB = user("account-b");
      let complete!: (value: User) => void;
      const pendingUser = new Promise<User>((resolve) => {
        complete = resolve;
      });
      if (method === "google") mocks.loginWithGoogle.mockReturnValue(pendingUser);
      else if (method === "github") mocks.loginWithGitHub.mockReturnValue(pendingUser);
      else mocks.registerWithEmail.mockReturnValue(pendingUser);
      mount();
      await publish(null);
      const pending =
        method === "google"
          ? currentAuth.signInWithGoogle()
          : method === "github"
            ? currentAuth.signInWithGitHub()
            : currentAuth.signUpWithEmail("Account A", "a@example.com", "password123");
      const outcome = pending.then(
        () => null,
        (failure: unknown) => failure,
      );
      mocks.auth.currentUser = accountB;
      await publish(accountB);
      await act(async () => {
        complete(accountA);
        await outcome;
      });
      expect(await outcome).toMatchObject({ code: "auth/user-token-expired" });
      expect(screen.getByTestId("identity")).toHaveTextContent("account-b");
      expect(getSession()?.uid).toBe("account-b");
      saveProject(project("New account B work"));
      expect(localStorage.getItem("lunova.user.account-a.projects")).toBeNull();
      expect(
        JSON.parse(localStorage.getItem("lunova.user.account-b.projects") || "[]")[0].name,
      ).toBe("New account B work");
    },
  );

  it.each(["signOut", "continueAsGuest"] as const)(
    "keeps a newer SDK identity when pending %s completes after another tab signs in",
    async (method) => {
      let complete!: () => void;
      mocks.logoutFirebase.mockReturnValue(
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
      );
      mount();
      await publish(user("account-a"));
      const pending = currentAuth[method]();
      const accountB = user("account-b");
      mocks.auth.currentUser = accountB;
      await publish(accountB);
      await act(async () => {
        complete();
        await pending;
      });
      expect(screen.getByTestId("identity")).toHaveTextContent("account-b");
      expect(getSession()?.uid).toBe("account-b");
      expect(sessionStorage.getItem("lunova.guest")).toBeNull();
    },
  );
});
