import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroBlueLaserBackground } from "@/components/draftwink/HeroBlueLaserBackground";

describe("HeroBlueLaserBackground Component", () => {
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: false,
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

  it("renders container and canvas element with default hero variant", () => {
    const { container } = render(<HeroBlueLaserBackground />);
    const wrapper = container.querySelector('[data-testid="hero-blue-laser-background"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("hero-laser-background");
    expect(wrapper).toHaveClass("pointer-events-none");
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("applies the top, full, and dim variant classes properly", () => {
    const { rerender } = render(<HeroBlueLaserBackground variant="full" />);
    expect(screen.getByTestId("hero-blue-laser-background")).toHaveClass("fixed");

    rerender(<HeroBlueLaserBackground variant="top" />);
    expect(screen.getByTestId("hero-blue-laser-background")).toHaveClass("h-[620px]");

    rerender(<HeroBlueLaserBackground variant="dim" />);
    expect(screen.getByTestId("hero-blue-laser-background")).toHaveClass("opacity-45");
  });

  it("merges custom className smoothly", () => {
    render(<HeroBlueLaserBackground className="custom-laser-test" />);
    expect(screen.getByTestId("hero-blue-laser-background")).toHaveClass("custom-laser-test");
  });

  it("renders motion toggle controls when showControls is enabled and toggles play/pause", () => {
    render(<HeroBlueLaserBackground showControls />);
    const pauseBtn = screen.getByRole("button", { name: "Pause background animation" });
    expect(pauseBtn).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    expect(screen.getByRole("button", { name: "Play background animation" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play background animation" }));
    expect(screen.getByRole("button", { name: "Pause background animation" })).toBeInTheDocument();
  });

  it("supports motion={false} and unmounts cleanly", () => {
    const { unmount } = render(<HeroBlueLaserBackground motion={false} interactive={false} />);
    expect(screen.getByTestId("hero-blue-laser-background")).toBeInTheDocument();
    expect(() => unmount()).not.toThrow();
  });
});

