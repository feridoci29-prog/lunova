import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/draftwink/PublicHeader";
import { DemoPreview } from "@/components/draftwink/DemoPreview";
import { HeroBlueLaserBackground } from "@/components/draftwink/HeroBlueLaserBackground";
export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Interactive preview — Draftwink" },
      {
        name: "description",
        content: "Explore three working website and app examples before you sign in.",
      },
    ],
  }),
  component: Preview,
});
function Preview() {
  return (
    <div className="dw-page">
      <HeroBlueLaserBackground variant="top" />
      <PublicHeader />
      <main className="dw-container dw-full-preview">
        <Link to="/" className="dw-text-link">
          <ArrowLeft size={13} /> Back to the beginning
        </Link>
        <div className="dw-section-heading mt-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              A little look at what’s possible.
            </h1>
            <p>Explore a working example. No account needed.</p>
          </div>
        </div>
        <DemoPreview full />
      </main>
    </div>
  );
}
