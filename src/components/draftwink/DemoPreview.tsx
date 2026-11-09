import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Code2, Monitor, Smartphone, Tablet, ArrowRight, Eye } from "lucide-react";
import { demoProjects, getDemoProject, type DemoProjectId } from "@/lib/demo-projects";
import { rememberDraft, draftPrompt } from "@/lib/draft-intent";
import { useAuth } from "@/components/lunova/AuthProvider";

export function DemoPreview({
  initial = "frame",
  selected,
  onSelect,
  full = false,
}: {
  initial?: DemoProjectId;
  selected?: DemoProjectId;
  onSelect?: (id: DemoProjectId) => void;
  full?: boolean;
}) {
  const [local, setLocal] = useState<DemoProjectId>(initial);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [code, setCode] = useState(false);
  const project = getDemoProject(selected ?? local);
  const { session } = useAuth();
  const navigate = useNavigate();
  const select = (id: DemoProjectId) => {
    setLocal(id);
    onSelect?.(id);
  };
  const useTemplate = () => {
    const draft = { prompt: project.prompt, kind: project.kind };
    if (session?.mode === "firebase")
      void navigate({ to: "/workspace", search: { prompt: draftPrompt(draft) } });
    else {
      rememberDraft(draft);
      void navigate({ to: "/signup" });
    }
  };
  return (
    <section className="dw-demo" aria-label="Interactive project preview">
      <div className="dw-demo-top">
        <span className="dw-demo-label">
          <i /> Interactive demo{" "}
          <span className="hidden sm:inline text-slate-500">/ {project.name.toLowerCase()}</span>
        </span>
        <div className="dw-demo-toolbar">
          <button type="button" aria-pressed={!code} onClick={() => setCode(false)}>
            <Eye size={13} /> Preview
          </button>
          <button type="button" aria-pressed={code} onClick={() => setCode(true)}>
            <Code2 size={13} /> Code
          </button>
          <span className="mx-1 h-4 w-px bg-white/10" />
          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const
          ).map(([value, Icon]) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} preview`}
              aria-pressed={viewport === value}
              onClick={() => {
                setViewport(value);
                setCode(false);
              }}
            >
              <Icon size={14} />
            </button>
          ))}
          {!full && (
            <Link to="/preview" aria-label="Open full preview">
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
      <div className="dw-demo-body">
        <aside className="dw-demo-sidebar">
          <h3>Your next starting point</h3>
          <p>
            Take a look around.
            <br />
            Make it yours when you’re ready.
          </p>
          {demoProjects.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={project.id === item.id}
              onClick={() => select(item.id)}
            >
              {item.name}
              <ArrowUpRight size={13} />
            </button>
          ))}
          <div className="dw-demo-callout">
            A real, interactive example.
            <br />
            Sign in to create your own copy.
            <button type="button" className="dw-button" onClick={useTemplate}>
              Use this template <ArrowRight size={12} />
            </button>
          </div>
        </aside>
        <div className="dw-demo-stage">
          {code ? (
            <pre aria-label="Template source code">
              <code>{project.html}</code>
            </pre>
          ) : (
            <iframe
              key={project.id}
              title={`${project.name} live preview`}
              className="dw-demo-frame"
              sandbox="allow-scripts allow-forms"
              srcDoc={project.html}
              style={{
                maxWidth: viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : "100%",
              }}
            />
          )}
        </div>
      </div>
      <div className="dw-demo-footer">
        <span>Example project · sample content · no account needed</span>
        <button type="button" className="dw-text-link" onClick={useTemplate}>
          Make it yours <ArrowRight size={11} />
        </button>
      </div>
    </section>
  );
}
