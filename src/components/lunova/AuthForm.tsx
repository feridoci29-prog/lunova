import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { GlassCard, LButton } from "./ui";
import { OAuthButtons, useCompleteSignIn } from "./AuthButtons";
import { useAuth } from "./AuthProvider";
import { authErrorMessage } from "@/lib/firebase-auth";
import { readDraft, type DraftIntent } from "@/lib/draft-intent";

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  signup = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string | undefined;
  signup?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="dw-auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="dw-auth-password">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={signup ? "new-password" : "current-password"}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="dw-auth-password-toggle"
          aria-label={`${show ? "Hide" : "Show"} ${label.toLowerCase()}`}
          onClick={() => setShow(!show)}
          disabled={disabled}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} role="alert" className="dw-auth-field-error">
          {error}
        </span>
      )}
    </div>
  );
}
export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const auth = useAuth();
  const complete = useCompleteSignIn();
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "", remember: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const [intent, setIntent] = useState<DraftIntent | null>(null);
  useEffect(() => setIntent(readDraft()), []);
  const busy = pending || auth.loading;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || inFlight.current) return;
    const next: Record<string, string> = {};
    const email = v.email.trim();
    if (mode === "signup" && v.name.trim().length < 2) next["name"] = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Enter a valid email address.";
    if (mode === "signup" && v.password.length < 8)
      next["password"] = "Password must be at least 8 characters.";
    if (mode === "signup" && v.confirm !== v.password) next["confirm"] = "Passwords do not match.";
    if (mode === "login" && !v.password) next["password"] = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    inFlight.current = true;
    setPending(true);
    try {
      if (mode === "signup") await auth.signUpWithEmail(v.name.trim(), email, v.password);
      else await auth.signInWithEmail(email, v.password, v.remember);
      await complete();
    } catch (error) {
      setErrors({ form: authErrorMessage(error) });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };
  return (
    <GlassCard strong className="dw-auth-card">
      <p className="dw-auth-card-eyebrow">
        {mode === "signup" ? "YOUR NEXT CHAPTER" : "GOOD TO SEE YOU"}
      </p>
      <h2>{mode === "signup" ? "Create your account" : "Sign in"}</h2>
      <p className="dw-auth-card-subtitle">
        {mode === "signup"
          ? "A fresh workspace for the ideas worth exploring."
          : "Your ideas are right where you left them."}
      </p>
      {intent && (
        <div className="dw-auth-intent">
          <strong>Your idea is coming with you.</strong>
          <p>{intent.prompt}</p>
        </div>
      )}
      <OAuthButtons
        disabled={busy}
        onPendingChange={(value) => {
          inFlight.current = value;
          setPending(value);
        }}
      />
      <div className="dw-auth-separator">or continue with email</div>
      <form className="dw-auth-form" onSubmit={submit} noValidate aria-busy={busy}>
        {mode === "signup" && (
          <div className="dw-auth-field">
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              value={v.name}
              onChange={(event) => setV({ ...v, name: event.target.value })}
              autoComplete="name"
              placeholder="Your name"
              disabled={busy}
            />
            {errors["name"] && (
              <span role="alert" className="dw-auth-field-error">
                {errors["name"]}
              </span>
            )}
          </div>
        )}
        <div className="dw-auth-field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={v.email}
            onChange={(event) => setV({ ...v, email: event.target.value })}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={busy}
            aria-invalid={!!errors["email"]}
          />
          {errors["email"] && (
            <span role="alert" className="dw-auth-field-error">
              {errors["email"]}
            </span>
          )}
        </div>
        <PasswordField
          id="auth-password"
          label="Password"
          value={v.password}
          onChange={(password) => setV({ ...v, password })}
          disabled={busy}
          error={errors["password"]}
          signup={mode === "signup"}
        />
        {mode === "signup" && (
          <PasswordField
            id="auth-confirm"
            label="Confirm password"
            value={v.confirm}
            onChange={(confirm) => setV({ ...v, confirm })}
            disabled={busy}
            error={errors["confirm"]}
            signup
          />
        )}
        {mode === "login" && (
          <div className="dw-auth-options">
            <label>
              <input
                type="checkbox"
                checked={v.remember}
                onChange={(event) => setV({ ...v, remember: event.target.checked })}
                disabled={busy}
              />{" "}
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        )}
        {(errors["form"] || auth.error) && (
          <p role="alert" className="dw-auth-error">
            {errors["form"] || auth.error}
          </p>
        )}
        <LButton type="submit" className="dw-auth-submit" disabled={busy}>
          {pending
            ? "Please wait…"
            : mode === "signup"
              ? "Create account with email"
              : "Sign in with email"}
          {!pending && <ArrowRight size={14} />}
        </LButton>
      </form>
      <p className="dw-auth-switch">
        {mode === "signup" ? (
          <>
            Already have an account?<Link to="/login">Log in</Link>
          </>
        ) : (
          <>
            New to Draftwink?<Link to="/signup">Create an account</Link>
          </>
        )}
      </p>
      <p className="mt-4 flex justify-center items-center gap-1.5 text-[8px] text-slate-500">
        <LockKeyhole size={10} /> Your account is secured with Firebase.
      </p>
    </GlassCard>
  );
}
