import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MoonBackground } from "@/components/lunova/MoonBackground";

const scene = vi.hoisted(() => ({ create: vi.fn(), pause: vi.fn(), dispose: vi.fn() }));
vi.mock("@/lib/ribbon-scene", () => ({ createRibbonScene: scene.create }));
let reduced = false;
let narrow = false;
beforeEach(() => {
  vi.resetAllMocks();
  reduced = false;
  narrow = false;
  scene.create.mockReturnValue({ pause: scene.pause, dispose: scene.dispose });
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query.includes("reduced-motion") ? reduced : narrow,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => true,
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Progressive ribbon background", () => {
  it("keeps a static SVG when animation is not requested", () => {
    const { container } = render(<MoonBackground />);
    expect(container.querySelector("svg.draft-ribbon-fallback")).toBeInTheDocument();
    expect(scene.create).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it.each(["reduced", "mobile"])("avoids WebGL for %s visitors", async (mode) => {
    reduced = mode === "reduced";
    narrow = mode === "mobile";
    const { container } = render(<MoonBackground motion />);
    await Promise.resolve();
    expect(scene.create).not.toHaveBeenCalled();
    expect(container.querySelector("svg.draft-ribbon-fallback")).toBeInTheDocument();
  });
  it("offers pause and resume outside the decorative subtree and disposes on unmount", async () => {
    const { unmount } = render(<MoonBackground motion />);
    const pause = await screen.findByRole("button", { name: "Pause background animation" });
    expect(pause.closest('[aria-hidden="true"]')).toBeNull();
    fireEvent.click(pause);
    expect(scene.pause).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Play background animation" }));
    expect(scene.pause).toHaveBeenLastCalledWith(false);
    unmount();
    expect(scene.dispose).toHaveBeenCalledTimes(1);
  });
  it("retains the fallback after WebGL initialization fails", async () => {
    scene.create.mockImplementation(() => {
      throw new Error("WebGL unavailable");
    });
    const { container } = render(<MoonBackground motion />);
    await waitFor(() => expect(scene.create).toHaveBeenCalledTimes(1));
    expect(container.querySelector("svg.draft-ribbon-fallback--quiet")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
