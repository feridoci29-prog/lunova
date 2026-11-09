import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { useAuth } from "./AuthProvider";

/** Keep workspace route effects unmounted until their identity is resolved. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, error, session } = useAuth();
  if (loading || error || !session) return <AppShell>{null}</AppShell>;
  return children;
}
