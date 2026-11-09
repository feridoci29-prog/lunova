import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { demoProjects, type DemoProject, type DemoProjectId } from "@/lib/demo-projects";

function TemplateCard({
  project,
  onSelect,
}: {
  project: DemoProject;
  onSelect: (id: DemoProjectId) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0.34);
  useEffect(() => {
    if (!ref.current) return;
    const resize = () => setScale((ref.current?.clientWidth || 374) / 1100);
    const observer = new ResizeObserver(resize);
    observer.observe(ref.current);
    resize();
    return () => observer.disconnect();
  }, []);
  return (
    <article className="dw-template-card">
      <button
        ref={ref}
        type="button"
        className="dw-template-visual"
        aria-label={`Preview ${project.name}`}
        onClick={() => onSelect(project.id)}
      >
        <iframe
          title={`${project.name} template thumbnail`}
          srcDoc={project.html}
          sandbox=""
          tabIndex={-1}
          loading="lazy"
          aria-hidden="true"
          style={{ transform: `scale(${scale})` }}
        />
        <span className="dw-template-hover">
          <span>Explore template ↗</span>
        </span>
      </button>
      <div className="dw-template-caption">
        <div>
          <strong>{project.name}</strong>
          <span> / {project.category}</span>
        </div>
        <button
          type="button"
          aria-label={`Explore ${project.name}`}
          onClick={() => onSelect(project.id)}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
export function TemplateGallery({ onSelect }: { onSelect: (id: DemoProjectId) => void }) {
  return (
    <div className="dw-template-grid">
      {demoProjects.map((project) => (
        <TemplateCard key={project.id} project={project} onSelect={onSelect} />
      ))}
    </div>
  );
}
