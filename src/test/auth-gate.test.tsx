import { cleanup, render } from "@testing-library/react";
import { useEffect, type ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthGate } from "@/components/lunova/AuthGate";

const state = vi.hoisted(() => ({
  loading: true,
  error: null as string | null,
  session: null as null | { uid: string },
}));
vi.mock("@/components/lunova/AuthProvider", () => ({ useAuth: () => state }));
vi.mock("@/components/lunova/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>Waiting for sign-in{children}</div>,
}));
afterEach(cleanup);

it("does not consume a direct workspace prompt or write a project before identity is restored", () => {
  const saveProject = vi.fn();
  function Workspace() {
    useEffect(() => {
      saveProject(state.session?.uid);
    }, []);
    return <div>Workspace</div>;
  }
  state.loading = true;
  state.error = null;
  state.session = null;
  const view = render(
    <AuthGate>
      <Workspace />
    </AuthGate>,
  );
  expect(saveProject).not.toHaveBeenCalled();
  state.loading = false;
  view.rerender(
    <AuthGate>
      <Workspace />
    </AuthGate>,
  );
  expect(saveProject).not.toHaveBeenCalled();
  state.error = "Connection failed";
  view.rerender(
    <AuthGate>
      <Workspace />
    </AuthGate>,
  );
  expect(saveProject).not.toHaveBeenCalled();
  state.error = null;
  state.session = { uid: "restored-account" };
  view.rerender(
    <AuthGate>
      <Workspace />
    </AuthGate>,
  );
  expect(saveProject).toHaveBeenCalledExactlyOnceWith("restored-account");
});
