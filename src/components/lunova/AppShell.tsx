import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  Plus,
  FolderOpen,
  LayoutTemplate,
  Settings,
  LogOut,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Brand } from "./Brand";
import { MoonBackground } from "./MoonBackground";
import { useAuth } from "./AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { authErrorMessage } from "@/lib/firebase-auth";
const nav = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/projects", label: "My projects", icon: FolderOpen },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
export function useSession() {
  return useAuth().session;
}
export function AppShell({
  children,
  bg = "dim",
  fullBleed = false,
}: {
  children: ReactNode;
  bg?: "full" | "dim" | "top";
  fullBleed?: boolean;
}) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { session, loading, error, signOut } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await signOut();
      await navigate({ to: "/" });
    } catch (failure) {
      toast.error(authErrorMessage(failure));
    } finally {
      setLeaving(false);
    }
  };
  if (loading || error || !session)
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <MoonBackground />
        <div className="glass-strong max-w-md rounded-2xl p-9">
          <Brand className="mb-7" />
          {loading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Restoring your workspace…
            </p>
          ) : error ? (
            <>
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              <button
                type="button"
                className="dw-button mt-6"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Make this draft yours.</h1>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                Sign in to continue your work. You can explore our examples first.
              </p>
              <Link to="/login" className="dw-button mt-6">
                Log in <ArrowUpRight size={14} />
              </Link>
              <Link to="/preview" className="block text-xs mt-5 text-ice">
                Back to preview
              </Link>
            </>
          )}
        </div>
      </div>
    );
  return (
    <div className="draft-shell">
      <MoonBackground variant={bg} />
      <aside className="draft-sidebar">
        <Brand />
        <Link to="/workspace" className="dw-button">
          <Plus size={14} /> New draft
        </Link>
        <nav aria-label="Workspace navigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={path.startsWith(item.to) ? "page" : undefined}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/preview"
          className="mt-8 px-3 text-[10px] text-slate-500 flex items-center gap-2"
        >
          Explore the gallery <ArrowUpRight size={12} />
        </Link>
        <div className="draft-account">
          <Link to="/settings" className="draft-avatar" aria-label="Account settings">
            {session.name.slice(0, 1).toUpperCase()}
          </Link>
          <div className="draft-account-name">
            <strong>{session.name}</strong>
            <small>{session.mode === "guest" ? "Guest workspace" : session.email}</small>
          </div>
          <button type="button" aria-label="Sign out" disabled={leaving} onClick={leave}>
            <LogOut size={14} />
          </button>
        </div>
      </aside>
      <div className="draft-shell-main">
        <header className="draft-shell-top">
          <span>
            Workspace <ChevronRight size={12} />{" "}
            {path === "/workspace"
              ? "Your draft"
              : (nav.find((item) => path.startsWith(item.to))?.label ?? "Draftwink")}
          </span>
          <span className="draft-mobile-brand">
            <Brand />
          </span>
          <span className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <span className="hidden sm:inline">Saved on this device</span>
            <button
              type="button"
              className="md:hidden p-2"
              aria-label="Sign out"
              disabled={leaving}
              onClick={leave}
            >
              <LogOut size={15} />
            </button>
          </span>
        </header>
        <main className={fullBleed ? "" : "draft-shell-content"}>{children}</main>
      </div>
      <nav className="draft-shell-mobile" aria-label="Mobile navigation">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={path.startsWith(item.to) ? "page" : undefined}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
