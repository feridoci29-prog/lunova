// Projects and preferences stay in this browser, isolated by Firebase UID.
// Guest data keeps its original keys so existing demo work is preserved.
export type ProjectFiles = Record<string, string>;
export type ChatMessage = { role: "user" | "assistant"; content: string; at: number };
export type ProjectKind = "website" | "app" | "document";
export type ProjectVersion = {
  id: string;
  createdAt: number;
  summary: string;
  name: string;
  kind: ProjectKind;
  accent: string;
  files: ProjectFiles;
  messages: ChatMessage[];
};
export type Project = {
  id: string;
  name: string;
  kind: ProjectKind;
  files: ProjectFiles;
  messages: ChatMessage[];
  updatedAt: number;
  accent: string; // thumbnail tint (css color of the user's site, not Draftwink theme)
  starred?: boolean;
  versions?: ProjectVersion[];
};
export type Session = {
  name: string;
  email: string;
  mode: "guest" | "firebase";
  uid?: string;
  emailVerified?: boolean;
  hasPassword?: boolean;
};
export type Prefs = {
  language: string;
  region: string;
  theme: "cosmic" | "midnight" | "system";
  notifyEmail: boolean;
  notifyProduct: boolean;
  notifyShares: boolean;
  twoFactor: boolean;
};

const isBrowser = () => typeof window !== "undefined";
const read = <T>(k: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => isBrowser() && localStorage.setItem(k, JSON.stringify(v));

export const uid = () => Math.random().toString(36).slice(2, 10);

// This is only a view of the Firebase observer's current session. Never restore
// identity from the old editable lunova.session value in localStorage.
let currentSession: Session | null = null;
let storagePrefix: string | null = "lunova";

export const getSession = (): Session | null => (currentSession ? { ...currentSession } : null);
export function setSession(session: Session | null) {
  currentSession = null;
  storagePrefix = null;
  if (session?.mode === "firebase") {
    if (typeof session.uid !== "string" || !session.uid.trim() || session.uid.length > 128) {
      throw new Error("A Firebase session requires a valid user ID.");
    }
    // Encoding prevents special characters in custom UIDs from changing the key
    // structure. Invalid Unicode also fails closed before assigning ownership.
    storagePrefix = `lunova.user.${encodeURIComponent(session.uid)}`;
  } else if (!session || session.mode === "guest") {
    // Null is the unauthenticated guest scope. The UI waits for Firebase's
    // initial session before rendering a workspace or reading its projects.
    storagePrefix = "lunova";
  } else {
    throw new Error("Unknown session type.");
  }
  currentSession = session ? { ...session } : null;
}

function storageKey(resource: "prefs" | "projects") {
  if (!storagePrefix) throw new Error("Local workspace identity is unavailable.");
  return `${storagePrefix}.${resource}`;
}

export const defaultPrefs: Prefs = {
  language: "en",
  region: "US",
  theme: "cosmic",
  notifyEmail: true,
  notifyProduct: false,
  notifyShares: true,
  twoFactor: false,
};
export const getPrefs = () => ({
  ...defaultPrefs,
  ...read<Partial<Prefs>>(storageKey("prefs"), {}),
});
export const setPrefs = (p: Prefs) => write(storageKey("prefs"), p);

export function listProjects(): Project[] {
  return read<Project[]>(storageKey("projects"), []).sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getProject(id: string) {
  return listProjects().find((p) => p.id === id);
}
export function saveProject(p: Project) {
  const key = storageKey("projects");
  const all = read<Project[]>(key, []).filter((x) => x.id !== p.id);
  write(key, [{ ...p, updatedAt: Date.now() }, ...all]);
}
export function deleteProject(id: string) {
  const key = storageKey("projects");
  write(
    key,
    read<Project[]>(key, []).filter((x) => x.id !== id),
  );
}

/** Save a bounded, non-recursive content snapshot only after the write succeeds. */
export function saveProjectRevision(project: Project, summary: string): Project {
  const at = Date.now();
  const version: ProjectVersion = {
    id: uid(),
    createdAt: at,
    summary: summary.trim().slice(0, 180) || "Saved changes",
    name: project.name,
    kind: project.kind,
    accent: project.accent,
    files: { ...project.files },
    messages: project.messages.map((message) => ({ ...message })),
  };
  const next: Project = {
    ...project,
    updatedAt: at,
    versions: [version, ...(project.versions ?? [])].slice(0, 20),
  };
  saveProject(next);
  return next;
}

export function restoreProjectVersion(projectId: string, versionId: string): Project | null {
  const project = getProject(projectId);
  const version = project?.versions?.find((item) => item.id === versionId);
  if (!project || !version) return null;
  return saveProjectRevision(
    {
      ...project,
      name: version.name,
      kind: version.kind,
      accent: version.accent,
      files: { ...version.files },
      messages: version.messages.map((message) => ({ ...message })),
    },
    "Restored: " + version.summary,
  );
}

/** Combine index.html + style.css + script.js into a single sandboxed srcdoc. */
export function buildSrcDoc(files: ProjectFiles) {
  let html = files["index.html"] ?? "<p>No index.html</p>";
  const css = files["style.css"] ?? "";
  const js = files["script.js"] ?? "";
  html = html.replace(/<link[^>]*href="style\.css"[^>]*>/, `<style>${css}</style>`);
  html = html.replace(
    /<script[^>]*src="script\.js"[^>]*><\/script>/,
    `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`,
  );
  return html;
}

export function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
