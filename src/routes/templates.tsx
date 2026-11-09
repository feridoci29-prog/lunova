import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PublicHeader } from "@/components/draftwink/PublicHeader";
import { DemoPreview } from "@/components/draftwink/DemoPreview";
import { TemplateGallery } from "@/components/draftwink/TemplateGallery";
import { HeroBlueLaserBackground } from "@/components/draftwink/HeroBlueLaserBackground";
import type { DemoProjectId } from "@/lib/demo-projects";
export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Draftwink" },
      { name: "description", content: "Explore working templates before you sign in." },
    ],
  }),
  component: Templates,
});
function Templates() {
  const [selected, setSelected] = useState<DemoProjectId>("frame");
  const preview = useRef<HTMLDivElement>(null);
  return (
    <div className="dw-page">
      <HeroBlueLaserBackground variant="top" />
      <PublicHeader />
      <main className="dw-container">
        <section className="dw-section">
          <p className="text-[9px] tracking-[.22em] text-ice mb-4">A FRESH START</p>
          <h1 className="text-4xl font-bold tracking-[-.05em]">A direction worth exploring.</h1>
          <p className="text-sm text-slate-400 mt-4 mb-9 max-w-xl leading-7">
            Three working examples, each with a point of view. Explore before you sign in, then make
            a copy your own.
          </p>
          <TemplateGallery
            onSelect={(id) => {
              setSelected(id);
              preview.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </section>
        <div ref={preview} className="dw-section">
          <DemoPreview selected={selected} onSelect={setSelected} />
        </div>
      </main>
      <footer className="dw-footer">Draftwink · From thought to first draft.</footer>
    </div>
  );
}
