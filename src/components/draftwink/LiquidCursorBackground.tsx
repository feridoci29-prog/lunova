import { useEffect } from "react";

export function LiquidCursorBackground() {
  useEffect(() => {
    const canvas = document.getElementById("liquid") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let cursorX = width / 2;
    let cursorY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      cursorX += (mouseX - cursorX) * 0.08;
      cursorY += (mouseY - cursorY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        cursorX,
        cursorY,
        0,
        cursorX,
        cursorY,
        450
      );
      gradient.addColorStop(0, "rgba(143, 176, 255, 0.18)");
      gradient.addColorStop(0.5, "rgba(110, 140, 255, 0.06)");
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 450, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="liquid"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}