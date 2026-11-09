import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ShieldCheck, HardDrive, Download, ArrowRight } from "lucide-react";
import { AppShell, useSession } from "@/components/lunova/AppShell";
import { useAuth } from "@/components/lunova/AuthProvider";
import { authErrorMessage } from "@/lib/firebase-auth";
import { listProjects } from "@/lib/lunova-store";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Account settings — Draftwink" }] }),
  component: Settings,
});
function Settings() {
  const session = useSession();
  const { resetPassword } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const reset = async () => {
    if (busy || !session?.email) return;
    setBusy(true);
    setError("");
    try {
      await resetPassword(session.email);
      setMessage("If an account uses this email, you will receive a password reset link.");
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  const exportProjects = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { brand: "Draftwink", exportedAt: new Date().toISOString(), projects: listProjects() },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "draftwink-projects-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  return (
    <AppShell>
      <p className="text-[9px] tracking-[.2em] text-ice mb-4">MAKE YOURSELF AT HOME</p>
      <h1 className="text-3xl font-bold tracking-[-.05em]">Your account.</h1>
      <p className="text-xs text-slate-400 mt-4 mb-9">
        A few essentials for your creative workspace.
      </p>
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="glass rounded-2xl p-7">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-3">
              <Mail size={16} className="text-ice" /> Profile
            </h2>
            <span className="text-[9px] text-emerald-300">
              {session?.mode === "firebase" ? "Connected account" : "Guest"}
            </span>
          </div>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-[10px] text-slate-500 mb-2">Name</dt>
              <dd className="text-sm">{session?.name}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500 mb-2">Email</dt>
              <dd className="text-sm break-all">{session?.email}</dd>
            </div>
          </dl>
        </section>
        <section className="glass rounded-2xl p-7">
          <h2 className="font-semibold flex items-center gap-3">
            <ShieldCheck size={16} className="text-ice" />
            Sign-in & security
          </h2>
          <p className="mt-6 text-xs text-slate-400 leading-7">
            Your account uses Firebase Authentication. Manage two-step verification with the
            provider you use to sign in.
          </p>
          {session?.hasPassword ? (
            <button
              type="button"
              className="dw-button dw-button--outline mt-6"
              disabled={busy}
              onClick={reset}
            >
              {busy ? "Sending reset link…" : "Reset password"}
              <ArrowRight size={13} />
            </button>
          ) : (
            <p className="mt-5 text-[10px] text-slate-500">
              You use a social sign-in provider. Manage its password in that provider’s account
              settings.
            </p>
          )}
          {message && (
            <p role="status" className="text-xs text-emerald-200 leading-6 mt-5">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs text-rose-300 mt-5">
              {error}
            </p>
          )}
        </section>
        <section className="glass rounded-2xl p-7 lg:col-span-2">
          <h2 className="font-semibold flex items-center gap-3">
            <HardDrive size={16} className="text-ice" /> Your work, on this device
          </h2>
          <p className="mt-6 text-xs text-slate-400 leading-7 max-w-2xl">
            Your drafts and their version history are saved in this browser, separately for each
            account. They do not sync between devices yet. Download a backup before clearing browser
            data.
          </p>
          <button
            type="button"
            className="dw-button dw-button--outline mt-6"
            onClick={exportProjects}
          >
            <Download size={13} />
            Export project backup
          </button>
        </section>
      </div>
    </AppShell>
  );
}
