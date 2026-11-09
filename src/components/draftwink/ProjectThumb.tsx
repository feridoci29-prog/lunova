import { useEffect, useRef, useState } from "react";
import { buildSrcDoc, type Project } from "@/lib/lunova-store";
export function ProjectThumb({ project }: { project: Project }) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    if (!host.current) return;
    const resize = () => setScale((host.current?.clientWidth || 300) / 1100);
    const observer = new ResizeObserver(resize);
    observer.observe(host.current);
    resize();
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={host}
      className="aspect-[1.65] overflow-hidden rounded-xl border border-white/5 bg-slate-900"
    >
      <iframe
        title={`${project.name} thumbnail`}
        srcDoc={buildSrcDoc(project.files)}
        sandbox=""
        tabIndex={-1}
        aria-hidden="true"
        loading="lazy"
        style={{
          width: 1100,
          height: 690,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
