import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthForm } from "@/components/lunova/AuthForm";
import { clearDraft, readDraft, rememberDraft } from "@/lib/draft-intent";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithGitHub: vi.fn(),
  resetPassword: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/lunova/AuthProvider", () => ({
  useAuth: () => ({
    loading: false,
    error: null,
    signInWithEmail: mocks.signInWithEmail,
    signUpWithEmail: mocks.signUpWithEmail,
    signInWithGoogle: mocks.signInWithGoogle,
    signInWithGitHub: mocks.signInWithGitHub,
    resetPassword: mocks.resetPassword,
  }),
}));
vi.mock("@/lib/firebase-auth", () => ({
  authErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Unable to sign in.",
}));
vi.mock("sonner", () => ({ toast: { success: mocks.success } }));

beforeEach(() => {
  clearDraft();
  vi.resetAllMocks();
  mocks.navigate.mockResolvedValue(undefined);
  mocks.signInWithEmail.mockResolvedValue(undefined);
  mocks.signUpWithEmail.mockResolvedValue(undefined);
  mocks.signInWithGoogle.mockResolvedValue(undefined);
  mocks.signInWithGitHub.mockResolvedValue(undefined);
  mocks.resetPassword.mockResolvedValue(undefined);
});
afterEach(cleanup);

const fillLogin = (password = "password123") => {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
};

describe("Firebase account forms", () => {
  it("waits for Firebase before navigating and disables competing sign-in actions", async () => {
    let complete!: () => void;
    mocks.signInWithEmail.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
    );
    render(<AuthForm mode="login" />);
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Please wait…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with GitHub" })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    expect(mocks.signInWithEmail).toHaveBeenCalledTimes(1);

    await act(async () => {
      complete();
    });
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("keeps failed email sign-in on the form with a visible error", async () => {
    mocks.signInWithEmail.mockRejectedValue(new Error("Email or password is incorrect."));
    render(<AuthForm mode="login" />);
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign in with email" })).toBeEnabled();
  });

  it("allows existing short passwords at login and passes the remember setting", async () => {
    render(<AuthForm mode="login" />);
    fillLogin("six123");
    fireEvent.click(screen.getByRole("checkbox", { name: "Remember me" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(mocks.signInWithEmail).toHaveBeenCalledWith("person@example.com", "six123", false);
  });

  it("creates an account with trimmed name/email and an unchanged password", async () => {
    render(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "  Orbit User  " } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: " password123 " } });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: " password123 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account with email" }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(mocks.signUpWithEmail).toHaveBeenCalledWith(
      "Orbit User",
      "person@example.com",
      " password123 ",
    );
    expect(mocks.signInWithEmail).not.toHaveBeenCalled();
  });

  it("validates signup fields without creating a local substitute account", () => {
    render(<AuthForm mode="signup" />);
    fireEvent.click(screen.getByRole("button", { name: "Create account with email" }));
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(mocks.signUpWithEmail).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("links to the dedicated password reset page", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(mocks.resetPassword).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("retains the draft through a failed login and opens it after successful authentication", async () => {
    rememberDraft({ prompt: "A quiet reading tracker", kind: "app" });
    mocks.signInWithEmail.mockRejectedValueOnce(new Error("Try again"));
    render(<AuthForm mode="login" />);
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));
    await screen.findByRole("alert");
    expect(readDraft()?.prompt).toBe("A quiet reading tracker");
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: "/workspace",
        search: { prompt: "Create an app: A quiet reading tracker" },
      }),
    );
    expect(readDraft()).toBeNull();
  });

  it("rejects mismatched signup confirmation", () => {
    render(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Draft User" } });
    fillLogin();
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account with email" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/match/i);
    expect(mocks.signUpWithEmail).not.toHaveBeenCalled();
  });

  it("shows Google failure without navigating and restores both provider buttons", async () => {
    mocks.signInWithGoogle.mockRejectedValue(new Error("Sign-in was cancelled. Please try again."));
    render(<AuthForm mode="login" />);
    expect(screen.getByRole("button", { name: "Continue with GitHub" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sign-in was cancelled");
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign in with email" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Continue with GitHub" })).toBeEnabled();
  });

  it("opens the workspace after successful Google sign-in", async () => {
    render(<AuthForm mode="login" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" }));
    expect(mocks.signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("opens the workspace only after successful GitHub sign-in", async () => {
    let complete!: () => void;
    mocks.signInWithGitHub.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
    );
    render(<AuthForm mode="login" />);
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: "Continue with GitHub" }));

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Connecting to GitHub…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Please wait…" })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Connecting to GitHub…" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);
    expect(mocks.signInWithGitHub).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithGoogle).not.toHaveBeenCalled();
    expect(mocks.signInWithEmail).not.toHaveBeenCalled();

    await act(async () => {
      complete();
    });
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("shows GitHub cancellation without navigating and allows another sign-in method", async () => {
    mocks.signInWithGitHub.mockRejectedValue(new Error("Sign-in was cancelled. Please try again."));
    render(<AuthForm mode="signup" />);
    fireEvent.click(screen.getByRole("button", { name: "Continue with GitHub" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sign-in was cancelled");
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Continue with GitHub" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Create account with email" })).toBeEnabled();
  });
});
