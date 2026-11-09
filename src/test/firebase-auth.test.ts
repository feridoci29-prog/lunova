import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import {
  authErrorMessage,
  firebaseSession,
  getFirebaseAuth,
  loginWithEmail,
  loginWithGoogle,
  loginWithGitHub,
  logoutFirebase,
  registerWithEmail,
  requestPasswordReset,
} from "@/lib/firebase-auth";

const sdk = vi.hoisted(() => ({
  app: { name: "test-app" },
  auth: { name: "test-auth" },
  local: { type: "LOCAL" },
  session: { type: "SESSION" },
  getApps: vi.fn(),
  getApp: vi.fn(),
  initializeApp: vi.fn(),
  getAuth: vi.fn(),
  setPersistence: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  setCustomParameters: vi.fn(),
  addScope: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: sdk.getApps,
  getApp: sdk.getApp,
  initializeApp: sdk.initializeApp,
}));
vi.mock("firebase/auth", () => ({
  browserLocalPersistence: sdk.local,
  browserSessionPersistence: sdk.session,
  getAuth: sdk.getAuth,
  setPersistence: sdk.setPersistence,
  signInWithEmailAndPassword: sdk.signInWithEmailAndPassword,
  signInWithPopup: sdk.signInWithPopup,
  createUserWithEmailAndPassword: sdk.createUserWithEmailAndPassword,
  updateProfile: sdk.updateProfile,
  sendPasswordResetEmail: sdk.sendPasswordResetEmail,
  signOut: sdk.signOut,
  GoogleAuthProvider: class {
    providerId = "google.com";
    setCustomParameters = sdk.setCustomParameters;
  },
  GithubAuthProvider: class {
    providerId = "github.com";
    addScope = sdk.addScope;
  },
}));

const user = {
  uid: "real-firebase-uid",
  email: "person@example.com",
  displayName: "Person",
  emailVerified: true,
  providerData: [{ providerId: "password" }],
} as User;

beforeEach(() => {
  vi.resetAllMocks();
  sdk.getApps.mockReturnValue([sdk.app]);
  sdk.getApp.mockReturnValue(sdk.app);
  sdk.initializeApp.mockReturnValue(sdk.app);
  sdk.getAuth.mockReturnValue(sdk.auth);
  sdk.setPersistence.mockResolvedValue(undefined);
  sdk.signInWithEmailAndPassword.mockResolvedValue({ user });
  sdk.signInWithPopup.mockResolvedValue({ user });
  sdk.createUserWithEmailAndPassword.mockResolvedValue({ user });
  sdk.updateProfile.mockResolvedValue(undefined);
  sdk.sendPasswordResetEmail.mockResolvedValue(undefined);
  sdk.signOut.mockResolvedValue(undefined);
});

describe("Firebase authentication service", () => {
  it("reuses the existing Firebase app instead of initializing it again", () => {
    expect(getFirebaseAuth()).toBe(sdk.auth);
    expect(sdk.getAuth).toHaveBeenCalledWith(sdk.app);
    expect(sdk.initializeApp).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "uses the requested remember-me policy (%s) without trimming the password",
    async (remember) => {
      expect(await loginWithEmail("  person@example.com  ", "  password  ", remember)).toBe(user);
      expect(sdk.setPersistence).toHaveBeenCalledWith(sdk.auth, remember ? sdk.local : sdk.session);
      expect(sdk.signInWithEmailAndPassword).toHaveBeenCalledWith(
        sdk.auth,
        "person@example.com",
        "  password  ",
      );
      expect(sdk.setPersistence.mock.invocationCallOrder[0]).toBeLessThan(
        sdk.signInWithEmailAndPassword.mock.invocationCallOrder[0]!,
      );
    },
  );

  it("uses Google account selection and local persistence for popup sign-in", async () => {
    expect(await loginWithGoogle()).toBe(user);
    expect(sdk.setPersistence).toHaveBeenCalledWith(sdk.auth, sdk.local);
    expect(sdk.setCustomParameters).toHaveBeenCalledWith({ prompt: "select_account" });
    expect(sdk.signInWithPopup).toHaveBeenCalledWith(
      sdk.auth,
      expect.objectContaining({ providerId: "google.com" }),
    );
  });

  it("uses GitHub sign-in with email access and no repository permissions", async () => {
    expect(await loginWithGitHub()).toBe(user);
    expect(sdk.setPersistence).toHaveBeenCalledWith(sdk.auth, sdk.local);
    expect(sdk.signInWithPopup).toHaveBeenCalledWith(
      sdk.auth,
      expect.objectContaining({ providerId: "github.com" }),
    );
    expect(sdk.addScope.mock.calls).toEqual([["user:email"]]);
  });

  it("keeps rejected GitHub popup requests as failures", async () => {
    const failure = { code: "auth/popup-closed-by-user" };
    sdk.signInWithPopup.mockRejectedValue(failure);
    await expect(loginWithGitHub()).rejects.toBe(failure);
    expect(authErrorMessage(failure)).not.toContain("Google");
  });

  it("keeps a newly created account usable if updating its display name fails", async () => {
    sdk.updateProfile.mockRejectedValue({ code: "auth/network-request-failed" });
    expect(await registerWithEmail("  Full Name  ", "  person@example.com  ", "  password  ")).toBe(
      user,
    );
    expect(sdk.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      sdk.auth,
      "person@example.com",
      "  password  ",
    );
    expect(sdk.updateProfile).toHaveBeenCalledWith(user, { displayName: "Full Name" });
  });

  it("does not turn a failed account creation into a successful registration", async () => {
    const failure = { code: "auth/email-already-in-use" };
    sdk.createUserWithEmailAndPassword.mockRejectedValue(failure);
    await expect(registerWithEmail("Name", "person@example.com", "password")).rejects.toBe(failure);
    expect(sdk.updateProfile).not.toHaveBeenCalled();
  });

  it("gives unknown reset addresses a neutral response while preserving actionable failures", async () => {
    sdk.sendPasswordResetEmail.mockRejectedValueOnce({ code: "auth/user-not-found" });
    await expect(requestPasswordReset("  unknown@example.com  ")).resolves.toBeUndefined();
    expect(sdk.sendPasswordResetEmail).toHaveBeenCalledWith(sdk.auth, "unknown@example.com");
    const failure = { code: "auth/network-request-failed" };
    sdk.sendPasswordResetEmail.mockRejectedValueOnce(failure);
    await expect(requestPasswordReset("person@example.com")).rejects.toBe(failure);
  });

  it("delegates sign-out to Firebase and propagates failure", async () => {
    const failure = { code: "auth/network-request-failed" };
    sdk.signOut.mockRejectedValue(failure);
    await expect(logoutFirebase()).rejects.toBe(failure);
    expect(sdk.signOut).toHaveBeenCalledWith(sdk.auth);
  });

  it("derives account identity and password availability from the Firebase user", () => {
    expect(firebaseSession(user)).toMatchObject({
      uid: user.uid,
      mode: "firebase",
      name: "Person",
      hasPassword: true,
      emailVerified: true,
    });
    expect(
      firebaseSession({
        ...user,
        displayName: null,
        providerData: [{ providerId: "google.com" }],
      } as User),
    ).toMatchObject({ name: "person", hasPassword: false });
  });

  it("keeps raw backend errors private and treats bad credentials consistently", () => {
    expect(authErrorMessage({ code: "auth/wrong-password" })).toBe(
      authErrorMessage({ code: "auth/user-not-found" }),
    );
    expect(authErrorMessage(new Error("Sensitive backend details"))).not.toContain("Sensitive");
    expect(authErrorMessage({ code: "auth/popup-blocked" })).toMatch(/popup/i);
    expect(authErrorMessage({ code: "auth/unauthorized-domain" })).toMatch(/email/i);
    expect(authErrorMessage(null)).toMatch(/try again/i);
  });
});
