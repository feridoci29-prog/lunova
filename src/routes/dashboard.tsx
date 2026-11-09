import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, FolderOpen, LayoutTemplate, Plus, ArrowUpRight } from "lucide-react";
import { AppShell, useSession } from "@/components/lunova/AppShell";
import { ProjectThumb } from "@/components/draftwink/ProjectThumb";
import { listProjects, timeAgo, type Project } from "@/lib/lunova-store";
export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Your workspace — Draftwink" }] }),
  component: Dashboard,
});
function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => setProjects(listProjects()), []);
  return (
    <AppShell>
      <section className="max-w-3xl mx-auto text-center pt-6 pb-16">
        <p className="dw-eyebrow">A LITTLE ROOM FOR BIG IDEAS</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-[-.055em] mt-6">
          Hello, {session?.name.split(" ")[0] ?? "there"}.<br />
          <span className="text-ice">What’s your next draft?</span>
        </h1>
        <p className="text-xs text-slate-400 mt-5 leading-7">
          Start something new, or pick up right where you left off.
        </p>
        <form
          className="dw-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (prompt.trim())
              void navigate({ to: "/workspace", search: { prompt: prompt.trim() } });
          }}
        >
          <label htmlFor="workspace-idea" className="sr-only">
            Describe your next idea
          </label>
          <textarea
            id="workspace-idea"
            placeholder="A bold portfolio, a little shop, a fresh direction…"
            value={prompt}
            maxLength={6000}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <div className="dw-composer-bottom">
            <span className="dw-composer-hint">Local starter engine · editable source</span>
            <button type="submit" className="dw-button" disabled={!prompt.trim()}>
              Create draft <ArrowUp size={14} />
            </button>
          </div>
        </form>
        <div className="mt-6 flex justify-center gap-7 text-[10px] text-slate-400">
          <span className="flex items-center gap-2">
            <FolderOpen size={13} />
            {projects.length} saved {projects.length === 1 ? "draft" : "drafts"}
          </span>
          <Link to="/templates" className="flex items-center gap-2 text-ice">
            <LayoutTemplate size={13} />
            Explore templates <ArrowUpRight size={12} />
          </Link>
        </div>
      </section>
      <div className="dw-section-heading">
        <div>
          <h2>Your recent drafts</h2>
          <p>Saved in this browser, in your own workspace.</p>
        </div>
        <Link to="/projects" className="dw-text-link">
          View all <ArrowRight size={13} />
        </Link>
      </div>
      {projects.length ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.slice(0, 6).map((project) => (
            <Link
              key={project.id}
              to="/workspace"
              search={{ project: project.id }}
              className="glass rounded-2xl p-3 hover:border-slate-500/60 transition-colors"
            >
              <ProjectThumb project={project} />
              <div className="flex justify-between items-center gap-4 px-1 pt-4 pb-2">
                <span className="text-xs font-semibold truncate">{project.name}</span>
                <span className="text-[9px] text-slate-500 shrink-0">
                  {timeAgo(project.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <span className="inline-grid place-items-center w-12 h-12 rounded-xl bg-blue-300/10 text-ice">
            <Plus size={21} />
          </span>
          <h2 className="mt-5 font-semibold">A blank page. A good beginning.</h2>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Your projects will appear here. Describe an idea above or start from a template.
          </p>
          <Link to="/templates" className="dw-text-link mt-6">
            Find a starting point <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </AppShell>
  );
}
