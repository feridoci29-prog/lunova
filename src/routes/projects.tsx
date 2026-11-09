import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, Copy, Pencil, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/lunova/AppShell";
import { ProjectThumb } from "@/components/draftwink/ProjectThumb";
import {
  deleteProject,
  listProjects,
  saveProjectRevision,
  uid,
  timeAgo,
  type Project,
} from "@/lib/lunova-store";
export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "My projects — Draftwink" }] }),
  component: Projects,
});
function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  useEffect(() => setProjects(listProjects()), []);
  const refresh = () => setProjects(listProjects());
  const rename = (project: Project) => {
    const value = window.prompt("A new name for your draft", project.name);
    if (!value?.trim() || value.trim() === project.name) return;
    try {
      saveProjectRevision({ ...project, name: value.trim().slice(0, 80) }, "Renamed draft");
      refresh();
    } catch {
      toast.error("Could not save the new name.");
    }
  };
  const duplicate = (project: Project) => {
    try {
      saveProjectRevision(
        { ...project, id: uid(), name: `${project.name} — copy`, versions: [] },
        "Duplicated draft",
      );
      refresh();
      toast.success("A fresh copy is ready");
    } catch {
      toast.error("Could not save the copy.");
    }
  };
  const remove = (project: Project) => {
    if (
      !window.confirm(
        `Delete “${project.name}” from this device? This removes its saved history too.`,
      )
    )
      return;
    try {
      deleteProject(project.id);
      refresh();
    } catch {
      toast.error("Could not delete the draft.");
    }
  };
  const shown = projects
    .filter((project) => project.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt));
  return (
    <AppShell>
      <div className="dw-section-heading">
        <div>
          <p className="text-[9px] tracking-[.2em] text-ice mb-3">YOUR CREATIVE SPACE</p>
          <h1 className="text-3xl font-bold tracking-[-.05em]">Every idea, in one place.</h1>
          <p>
            {projects.length} saved {projects.length === 1 ? "draft" : "drafts"} on this device.
          </p>
        </div>
        <Link to="/workspace" className="dw-button">
          <Plus size={13} />
          New draft
        </Link>
      </div>
      <div className="flex flex-wrap justify-between gap-4 mb-7 mt-8">
        <label className="flex items-center gap-3 rounded-xl border border-slate-600/30 bg-slate-900/40 px-4 py-3 max-w-sm flex-1">
          <Search size={14} className="text-slate-500" />
          <input
            aria-label="Search projects"
            placeholder="Find a draft…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent outline-none text-xs"
          />
        </label>
        <select
          aria-label="Sort projects"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="text-xs bg-slate-900 border border-slate-600/30 rounded-xl px-4"
        >
          <option value="recent">Recently edited</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      {shown.length ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((project) => (
            <article key={project.id} className="glass rounded-2xl p-3">
              <Link to="/workspace" search={{ project: project.id }}>
                <ProjectThumb project={project} />
                <h2 className="text-xs font-semibold mt-4 px-1 truncate">{project.name}</h2>
              </Link>
              <div className="flex justify-between items-center mt-3 px-1 pb-1">
                <span className="text-[9px] text-slate-500">{timeAgo(project.updatedAt)}</span>
                <div className="flex gap-3 text-slate-500">
                  <button
                    type="button"
                    aria-label={`Rename ${project.name}`}
                    onClick={() => rename(project)}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Duplicate ${project.name}`}
                    onClick={() => duplicate(project)}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${project.name}`}
                    onClick={() => remove(project)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-14 text-center">
          <h2 className="font-semibold">
            {query ? "No drafts found." : "Your next idea starts here."}
          </h2>
          <p className="mt-3 text-xs text-slate-400">
            {query ? "Try a different search." : "Create a draft or explore a working template."}
          </p>
          {!query && (
            <Link to="/templates" className="dw-text-link mt-6">
              Explore templates <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
    </AppShell>
  );
}
