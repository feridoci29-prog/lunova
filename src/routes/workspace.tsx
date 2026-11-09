import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Code2,
  Download,
  Eye,
  History,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  ArrowUp,
  Save,
  MessageSquare,
  Plus,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/lunova/AppShell";
import { applyLocalEdit, generateLocal } from "@/lib/generator";
import {
  buildSrcDoc,
  getProject,
  saveProjectRevision,
  restoreProjectVersion,
  uid,
  type Project,
  type ProjectFiles,
} from "@/lib/lunova-store";
import { demoProjects } from "@/lib/demo-projects";
type Search = { prompt?: string | undefined; project?: string | undefined };
function templateFiles(html: string): ProjectFiles {
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const js = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
  return {
    "index.html": html
      .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="style.css">')
      .replace(/<script>[\s\S]*?<\/script>/, '<script src="script.js"></script>'),
    "style.css": css,
    "script.js": js,
  };
}
export const Route = createFileRoute("/workspace")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    prompt: typeof search["prompt"] === "string" ? search["prompt"].slice(0, 6000) : undefined,
    project: typeof search["project"] === "string" ? search["project"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your workspace — Draftwink" },
      {
        name: "description",
        content: "Shape your draft with a live preview, editable code and version history.",
      },
    ],
  }),
  component: Workspace,
});
function Workspace() {
  const { prompt, project: projectId } = Route.useSearch();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<"preview" | "code" | "history">("preview");
  const [mobileChat, setMobileChat] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [files, setFiles] = useState<ProjectFiles>({});
  const [file, setFile] = useState("index.html");
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const started = useRef("");
  const end = useRef<HTMLDivElement>(null);
  const accept = (value: Project) => {
    setProject(value);
    setFiles({ ...value.files });
    setName(value.name);
    setFile((current) =>
      current in value.files ? current : (Object.keys(value.files)[0] ?? "index.html"),
    );
  };
  useEffect(() => {
    try {
      if (projectId) {
        started.current = "";
        const existing = getProject(projectId);
        if (existing) {
          accept(existing);
          setError("");
        } else {
          setProject(null);
          setError("This draft isn’t available in your account on this device.");
        }
        return;
      }
      if (prompt && started.current !== prompt) {
        started.current = prompt;
        const template = demoProjects.find(
          (item) => item.prompt === prompt || `Create an app: ${item.prompt}` === prompt,
        );
        const generated = generateLocal(prompt);
        const initial: Project = {
          id: uid(),
          name: template?.name ?? generated.name,
          kind: template?.kind ?? generated.kind,
          files: template ? templateFiles(template.html) : generated.files,
          messages: [
            { role: "user", content: prompt, at: Date.now() },
            {
              role: "assistant",
              content: template
                ? "Your own copy is ready. Explore the preview, edit the source, or try a style change below."
                : "Your local starter is ready. Try ‘make the buttons blue’, ‘switch to dark’, or edit the source. This draft engine uses local templates; a generative AI provider is not connected yet.",
              at: Date.now(),
            },
          ],
          accent: template?.accent ?? generated.accent,
          updatedAt: Date.now(),
        };
        const saved = saveProjectRevision(
          initial,
          template ? "Created from template" : "Created first draft",
        );
        accept(saved);
        void navigate({ to: "/workspace", search: { project: saved.id }, replace: true });
      }
    } catch (failure) {
      setError("Your changes could not be saved. Check available browser storage and try again.");
      toast.error("Could not save the draft.");
    }
  }, [prompt, projectId, navigate]);
  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [project?.messages.length]);
  const dirty = !!project && JSON.stringify(files) !== JSON.stringify(project.files);
  const srcdoc = useMemo(() => buildSrcDoc(files), [files]);
  const commitFiles = () => {
    if (!project || !dirty) return;
    try {
      const saved = saveProjectRevision({ ...project, files: { ...files } }, `Edited ${file}`);
      setProject(saved);
      setError("");
    } catch {
      setError(
        "Could not save changes. Your edits are still here; free some browser storage and retry.",
      );
    }
  };
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const rename = () => {
    if (!project || !name.trim() || name.trim() === project.name) return;
    try {
      const saved = saveProjectRevision(
        { ...project, name: name.trim().slice(0, 80) },
        "Renamed draft",
      );
      setProject(saved);
      setName(saved.name);
    } catch {
      setError("Could not save the new name.");
    }
  };
  const send = () => {
    if (!project || !input.trim()) return;
    const text = input.trim();
    const edit = applyLocalEdit(text, files);
    const note = edit
      ? edit.note
      : "That request is beyond the local draft engine. Try a color, dark theme or text-size change, or edit the source in Code. A generative AI provider is not connected yet.";
    try {
      const saved = saveProjectRevision(
        {
          ...project,
          files: edit?.files ?? files,
          messages: [
            ...project.messages,
            { role: "user", content: text, at: Date.now() },
            { role: "assistant", content: note, at: Date.now() },
          ],
        },
        edit ? note : "Added a conversation note",
      );
      accept(saved);
      setInput("");
      setError("");
    } catch {
      setError("Could not save your change. Your request is still here; please try again.");
    }
  };
  const download = async () => {
    if (!project) return;
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const assets = ["/demo/frame-architecture.jpg", "/demo/olive-interior.jpg"];
      for (const asset of assets) {
        if (!Object.values(files).some((content) => content.includes(asset))) continue;
        const response = await fetch(asset);
        if (!response.ok) throw new Error("Image unavailable");
        zip.file(asset.slice(1), await response.arrayBuffer());
      }
      Object.entries(files).forEach(([path, content]) =>
        zip.file(
          path,
          assets.reduce((source, asset) => source.replaceAll(asset, asset.slice(1)), content),
        ),
      );
      const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "draft"}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch {
      toast.error("The download could not be prepared. Please try again.");
    }
  };
  const openPreview = () => {
    const previewDoc = srcdoc.replace(/<head>/i, `<head><base href="${window.location.origin}/">`);
    const escaped = previewDoc.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const wrapper = `<!doctype html><html><title>Draftwink preview</title><style>html,body,iframe{margin:0;border:0;width:100%;height:100%;display:block}</style><iframe title="Project preview" sandbox="allow-scripts allow-forms" srcdoc="${escaped}"></iframe></html>`;
    const url = URL.createObjectURL(new Blob([wrapper], { type: "text/html" }));
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const restore = (id: string) => {
    if (!project) return;
    try {
      const restored = restoreProjectVersion(project.id, id);
      if (restored) {
        accept(restored);
        setTab("preview");
        toast.success("Version restored");
      }
    } catch {
      setError("Could not restore this version. Your current draft is safe.");
    }
  };
  const [newIdea, setNewIdea] = useState("");
  if (!project)
    return (
      <AppShell>
        <div className="dwe-empty">
          <span className="draft-avatar">
            <Plus size={20} />
          </span>
          <h1>A little idea goes a long way.</h1>
          <p>
            {error ||
              "Tell us what you’d like to make. We’ll open a local starter you can shape into something yours."}
          </p>
          <form
            className="dw-composer w-full max-w-xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (newIdea.trim())
                void navigate({ to: "/workspace", search: { prompt: newIdea.trim() } });
            }}
          >
            <label htmlFor="new-idea" className="sr-only">
              Your new idea
            </label>
            <textarea
              id="new-idea"
              value={newIdea}
              onChange={(event) => setNewIdea(event.target.value)}
              placeholder="A café website with a warm, welcoming feel…"
              maxLength={6000}
            />
            <div className="dw-composer-bottom">
              <span className="dw-composer-hint">Local draft engine</span>
              <button className="dw-button" type="submit" disabled={!newIdea.trim()}>
                Create draft <ArrowUp size={14} />
              </button>
            </div>
          </form>
        </div>
      </AppShell>
    );
  return (
    <AppShell fullBleed>
      <div className="dwe-toolbar">
        <div className="flex items-center gap-3 min-w-0">
          <input
            aria-label="Project name"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            onBlur={rename}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <span className="dwe-save-status hidden sm:block">
            {dirty ? "Unsaved changes" : "Saved on this device"}
          </span>
        </div>
        <div className="dwe-tabs" role="tablist" aria-label="Editor views">
          <button
            type="button"
            className="dwe-mobile-chat-tab"
            aria-selected={mobileChat}
            role="tab"
            onClick={() => setMobileChat(true)}
          >
            <MessageSquare size={13} /> Chat
          </button>
          {(
            [
              ["preview", Eye, "Preview"],
              ["code", Code2, "Code"],
              ["history", History, "History"],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value && !mobileChat}
              onClick={() => {
                setTab(value);
                setMobileChat(false);
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
          <button type="button" onClick={download} aria-label="Download project ZIP">
            <Download size={14} />
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-300 bg-rose-900/20 px-5 py-3">
          {error}
        </p>
      )}
      <div className="dwe-grid">
        <section className="dwe-chat" data-mobile-hidden={!mobileChat}>
          <div className="dwe-chat-head">
            <h2>Your creative workspace</h2>
            <p>
              Local draft engine · shape the details.
              <br />
              Generative AI is not connected yet.
            </p>
          </div>
          <div className="dwe-messages">
            {project.messages.map((message, index) => (
              <div
                key={index}
                className={`dwe-message ${message.role === "user" ? "dwe-message--user" : ""}`}
              >
                <p className="dwe-message-label">{message.role === "user" ? "You" : "Draftwink"}</p>
                {message.content}
              </div>
            ))}
            <div ref={end} />
          </div>
          <form
            className="dwe-send"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <label htmlFor="draft-change" className="sr-only">
              Ask for a change
            </label>
            <textarea
              id="draft-change"
              value={input}
              maxLength={6000}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Make the buttons blue…"
            />
            <div className="dwe-send-bottom">
              <span>Small changes. New possibilities.</span>
              <button type="submit" aria-label="Send change request" disabled={!input.trim()}>
                <ArrowUp size={15} />
              </button>
            </div>
          </form>
        </section>
        <section className="dwe-preview" data-mobile-hidden={mobileChat}>
          {tab === "preview" ? (
            <>
              <div className="dwe-preview-bar">
                <span className="text-[9px] text-slate-500">
                  {project.name.toLowerCase().replace(/\s+/g, "-")} / preview
                </span>
                <div className="dwe-tabs">
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
                      aria-label={`${value} project preview`}
                      aria-pressed={viewport === value}
                      onClick={() => setViewport(value)}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openPreview}
                    aria-label="Open project preview in a new tab"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
              <div className="dwe-preview-stage">
                <iframe
                  title="Your project preview"
                  sandbox="allow-scripts allow-forms"
                  srcDoc={srcdoc}
                  style={{
                    maxWidth: viewport === "mobile" ? 390 : viewport === "tablet" ? 768 : "100%",
                  }}
                />
              </div>
            </>
          ) : tab === "code" ? (
            <>
              <div className="dwe-preview-bar">
                <span className="text-[10px] text-slate-400">
                  Edit your source. Preview updates as you type.
                </span>
                <button
                  className="dw-text-link"
                  type="button"
                  disabled={!dirty}
                  onClick={commitFiles}
                >
                  <Save size={12} /> Save changes
                </button>
              </div>
              <div className="dwe-code">
                <nav className="dwe-files" aria-label="Project files">
                  {Object.keys(files).map((path) => (
                    <button
                      key={path}
                      type="button"
                      aria-selected={file === path}
                      onClick={() => setFile(path)}
                    >
                      {path}
                    </button>
                  ))}
                </nav>
                <label className="sr-only" htmlFor="source-code">
                  Source code
                </label>
                <textarea
                  id="source-code"
                  value={files[file] ?? ""}
                  onChange={(event) => setFiles({ ...files, [file]: event.target.value })}
                  onBlur={commitFiles}
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <div className="dwe-history">
              <h2>A little history.</h2>
              <p>
                Every saved change leaves a starting point you can return to. The latest 20 versions
                are kept on this device.
              </p>
              {project.versions?.length ? (
                project.versions.map((version, index) => (
                  <div className="dwe-version" key={version.id}>
                    <div>
                      <strong>{version.summary}</strong>
                      <small>
                        {new Date(version.createdAt).toLocaleString()}{" "}
                        {index === 0 ? "· Current saved version" : ""}
                      </small>
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        className="dw-button dw-button--outline"
                        onClick={() => restore(version.id)}
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No versions yet. Save a change in Code to create your first checkpoint.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
