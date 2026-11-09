import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/lunova/AuthLayout";
import { useAuth } from "@/components/lunova/AuthProvider";
import { authErrorMessage } from "@/lib/firebase-auth";
export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Draftwink" }] }),
  component: PasswordReset,
});
function PasswordReset() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const pending = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <AuthLayout mode="reset">
      <section className="dw-auth-card">
        <p className="dw-auth-card-eyebrow">FIND YOUR WAY BACK</p>
        <h2>Forgot your password?</h2>
        <p className="dw-auth-card-subtitle">Enter your email and we’ll help you start again.</p>
        {sent ? (
          <div role="status" className="dw-auth-success">
            <MailCheck size={25} className="mb-3" />
            If an account uses this email, you will receive a password reset link. Check your inbox
            and spam folder.
            <Link to="/login" className="dw-text-link mt-5">
              Back to sign in <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <form className="dw-auth-form" onSubmit={submit} noValidate>
            <div className="dw-auth-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>
            {error && (
              <p role="alert" className="dw-auth-error">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="dw-button">
              {busy ? "Sending reset link…" : "Send reset link"}
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </section>
    </AuthLayout>
  );
}
