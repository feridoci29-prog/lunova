import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/draftwink/PublicHeader";
import { MoonBackground } from "@/components/lunova/MoonBackground";
export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Early access — Draftwink" }] }),
  component: () => (
    <div className="dw-page">
      <MoonBackground motion />
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="dw-eyebrow">ROOM FOR YOUR NEXT IDEA</p>
        <h1 className="mt-6 text-5xl font-bold tracking-[-.06em] leading-tight">
          A fresh start.
          <br />
          <span className="text-ice">Without the checkout.</span>
        </h1>
        <p className="mt-6 text-sm leading-7 text-slate-400 max-w-lg mx-auto">
          Draftwink is in early access. Explore the examples and create local drafts with an
          account. Paid plans and billing are not active.
        </p>
        <div className="glass-strong rounded-2xl p-8 mt-10 text-left max-w-md mx-auto">
          <p className="text-xs text-ice tracking-[.14em]">EARLY ACCESS</p>
          <h2 className="text-2xl font-semibold mt-3">Make room to experiment.</h2>
          <ul className="my-7 space-y-4 text-xs text-slate-300">
            {[
              "Interactive examples before sign-in",
              "Your own account workspace",
              "Local starter generation and source editing",
              "Live previews, version history and ZIP downloads",
            ].map((text) => (
              <li key={text} className="flex gap-3 items-center">
                <Check size={14} className="text-ice" />
                {text}
              </li>
            ))}
          </ul>
          <Link to="/signup" className="dw-button w-full">
            Create your account <ArrowRight size={14} />
          </Link>
          <p className="mt-4 text-[10px] text-slate-500 leading-5">
            Projects are stored on this device. A generative AI provider, cloud sync and paid
            publishing are not connected.
          </p>
        </div>
        <Link to="/preview" className="dw-text-link mt-7">
          Take a look first <ArrowRight size={13} />
        </Link>
      </main>
    </div>
  ),
});
