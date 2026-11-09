import { Github, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { GoogleIcon, LButton } from "./ui";
import { useAuth } from "./AuthProvider";
import { authErrorMessage } from "@/lib/firebase-auth";
import { readDraft, clearDraft, draftPrompt } from "@/lib/draft-intent";

export function useCompleteSignIn() {
  const navigate = useNavigate();
  return async () => {
    const draft = readDraft();
    if (draft) {
      await navigate({ to: "/workspace", search: { prompt: draftPrompt(draft) } });
      const pending = readDraft();
      if (pending?.prompt === draft.prompt && pending.kind === draft.kind) clearDraft();
    } else await navigate({ to: "/dashboard" });
  };
}

export function useGuest() {
  const navigate = useNavigate();
  const { continueAsGuest, loading } = useAuth();
  const pending = useRef(false);
  return async () => {
    if (pending.current || loading) return;
    pending.current = true;
    try {
      await continueAsGuest();
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      pending.current = false;
    }
  };
}

export function OAuthButtons({
  onEmail,
  disabled = false,
  onPendingChange,
}: {
  onEmail?: () => void;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const completeSignIn = useCompleteSignIn();
  const { signInWithGoogle, signInWithGitHub, loading } = useAuth();
  const [pending, setPending] = useState<"Google" | "GitHub" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const signIn = async (provider: "Google" | "GitHub") => {
    if (inFlight.current || disabled || loading) return;
    inFlight.current = true;
    setPending(provider);
    onPendingChange?.(true);
    setError(null);
    try {
      if (provider === "GitHub") await signInWithGitHub();
      else await signInWithGoogle();
      await completeSignIn();
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      inFlight.current = false;
      setPending(null);
      onPendingChange?.(false);
    }
  };
  const busy = disabled || loading || pending !== null;
  return (
    <div className="flex flex-col gap-2.5">
      <LButton
        type="button"
        className="dw-oauth-button"
        variant="light"
        disabled={busy}
        onClick={() => signIn("Google")}
      >
        <GoogleIcon />
        {pending === "Google" ? "Connecting to Google…" : "Continue with Google"}
      </LButton>
      <LButton
        type="button"
        className="dw-oauth-button"
        variant="dark"
        disabled={busy}
        onClick={() => signIn("GitHub")}
      >
        <Github className="h-4 w-4" />
        {pending === "GitHub" ? "Connecting to GitHub…" : "Continue with GitHub"}
      </LButton>
      {onEmail && (
        <LButton type="button" variant="dark" disabled={busy} onClick={onEmail}>
          <Mail className="h-4 w-4" /> Continue with Email
        </LButton>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
