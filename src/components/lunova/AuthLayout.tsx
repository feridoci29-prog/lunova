import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { HeroBlueLaserBackground } from "@/components/draftwink/HeroBlueLaserBackground";
import "./auth-layout.css";

const sample = `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#e8ecdf;color:#293323;font:12px Arial,sans-serif}nav{display:flex;justify-content:space-between;font-size:10px;margin-bottom:30px}h1{font:36px/1.05 Georgia,serif;letter-spacing:-1.5px;max-width:230px;margin:0}p{font-size:10px;line-height:1.6;max-width:190px;opacity:.75}.art{position:absolute;right:20px;top:68px;width:115px;height:145px;border-radius:70px 70px 0 0;background:radial-gradient(ellipse at 60% 30%,#d3bc92,transparent 65%),linear-gradient(125deg,#62745c,#b8c1a6);box-shadow:inset 10px 0 30px #31452e33}.dot{position:absolute;width:65px;height:65px;background:#aabd9c;border-radius:50%;right:83px;top:144px;border:9px solid #e8ecdf}button{margin-top:10px;background:#293323;color:#fff;border:0;border-radius:4px;padding:8px 12px;font-size:9px}footer{margin-top:27px;border-top:1px solid #29332322;padding-top:11px;display:flex;justify-content:space-between;font-size:8px}</style><nav><b>STUDIO NOTE</b><span>Work &nbsp; About &nbsp; Contact</span></nav><h1>A little room<br>for big ideas.</h1><p>Thoughtful spaces. Simple details.<br>A studio with a fresh perspective.</p><button>Explore our work ↗</button><div class="art"></div><div class="dot"></div><footer><span>Independent design studio</span><span>01 / 03</span></footer></html>`;

export function AuthLayout({
  mode,
  children,
}: {
  mode: "login" | "signup" | "reset";
  children: ReactNode;
}) {
  const signup = mode === "signup";
  const reset = mode === "reset";
  return (
    <div className="dw-auth-page">
      <HeroBlueLaserBackground variant="full" />
      <header className="dw-auth-header">
        <Brand />
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link to="/preview" className="dw-auth-back">
            <ArrowLeft size={15} /> Back to preview
          </Link>
        </div>
      </header>
      <main className="dw-auth-grid">
        <section className="dw-auth-story" aria-label="Your Draftwink workspace">
          <p className="dw-auth-eyebrow">
            <span /> A LITTLE IDEA GOES A LONG WAY
          </p>
          <h1>
            {reset ? (
              <>
                A fresh start.
                <br />
                <span>Same big ideas.</span>
              </>
            ) : signup ? (
              <>
                Your next idea.
                <br />
                <span>Make it yours.</span>
              </>
            ) : (
              <>
                Welcome back
                <br />
                to your <span>next draft.</span>
              </>
            )}
          </h1>
          <p className="dw-auth-intro">
            {reset
              ? "Get back to the things you were ready to make. We’ll help you find your way in."
              : "A calmer place to shape an idea, try a direction, and make something that feels like you."}
          </p>
          <div className="dw-auth-example">
            <div className="dw-auth-example-bar">
              <span className="dw-auth-window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>studio-note / preview</span>
              <ArrowUpRight size={12} />
            </div>
            <iframe title="Example project: Studio Note" srcDoc={sample} sandbox="" tabIndex={-1} />
            <div className="dw-auth-example-caption">
              <span>
                <Sparkles size={13} /> One idea. A new starting point.
              </span>
              <span>EXAMPLE PROJECT</span>
            </div>
          </div>
          <div className="dw-auth-notes">
            <span>
              <Check size={13} /> Your own workspace
            </span>
            <span>
              <Check size={13} /> Room to experiment
            </span>
          </div>
        </section>
        <div className="dw-auth-form-column">
          {children}
          <p className="dw-auth-bottom-note">
            {reset ? (
              <Link to="/login">Back to sign in</Link>
            ) : (
              <>
                <Link to="/preview">Explore before you sign in</Link>
                <span>·</span>
                <Link to="/forgot-password">Password help</Link>
              </>
            )}
          </p>
        </div>
      </main>
      <footer className="dw-auth-footer">
        <span>Draftwink — from thought to first draft.</span>
        <span>Make room for your next idea.</span>
      </footer>
    </div>
  );
}
