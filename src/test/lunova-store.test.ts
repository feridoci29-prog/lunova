import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultPrefs,
  deleteProject,
  getPrefs,
  getProject,
  getSession,
  listProjects,
  saveProject,
  setPrefs,
  setSession,
  type Project,
  type Session,
} from "@/lib/lunova-store";

const guest: Session = { name: "Guest", email: "", mode: "guest" };
const account = (uid: string): Session => ({ name: uid, email: `${uid}@example.com`, mode: "firebase", uid });
const project = (name: string): Project => ({
  id: "same-project-id",
  name,
  kind: "website",
  files: { "index.html": `<h1>${name}</h1>` },
  messages: [],
  updatedAt: 1,
  accent: "blue",
});

beforeEach(() => {
  localStorage.clear();
  setSession(null);
});

describe("account-scoped local project storage", () => {
  it("keeps existing guest projects and preferences without importing them into accounts", () => {
    localStorage.setItem("lunova.projects", JSON.stringify([project("Existing guest work")]));
    localStorage.setItem("lunova.prefs", JSON.stringify({ language: "tr" }));
    setSession(guest);
    expect(getProject("same-project-id")?.name).toBe("Existing guest work");
    expect(getPrefs().language).toBe("tr");

    setSession(account("account-a"));
    expect(listProjects()).toEqual([]);
    expect(getPrefs()).toEqual(defaultPrefs);

    setSession(guest);
    expect(getProject("same-project-id")?.name).toBe("Existing guest work");
    expect(getPrefs().language).toBe("tr");
  });

  it("isolates writes, updates and deletions between two accounts and the guest", () => {
    setSession(guest);
    saveProject(project("Guest project"));
    setSession(account("account-a"));
    saveProject(project("Account A project"));
    setPrefs({ ...defaultPrefs, language: "az" });
    setSession(account("account-b"));
    expect(listProjects()).toEqual([]);
    saveProject(project("Account B project"));
    setPrefs({ ...defaultPrefs, language: "tr" });

    setSession(account("account-a"));
    expect(getProject("same-project-id")?.name).toBe("Account A project");
    expect(getPrefs().language).toBe("az");
    saveProject(project("Account A updated"));
    expect(listProjects()).toHaveLength(1);
    expect(getProject("same-project-id")?.name).toBe("Account A updated");
    deleteProject("same-project-id");
    expect(listProjects()).toEqual([]);

    setSession(account("account-b"));
    expect(getProject("same-project-id")?.name).toBe("Account B project");
    expect(getPrefs().language).toBe("tr");
    setSession(guest);
    expect(getProject("same-project-id")?.name).toBe("Guest project");
    expect(getPrefs()).toEqual(defaultPrefs);
  });

  it("does not restore a forged or legacy session from browser storage on reload", async () => {
    localStorage.setItem("lunova.session", JSON.stringify(account("account-a")));
    setSession(account("account-a"));
    saveProject(project("Private account project"));
    vi.resetModules();
    const reloaded = await import("@/lib/lunova-store");
    expect(reloaded.getSession()).toBeNull();
    expect(reloaded.listProjects()).toEqual([]);
    reloaded.setSession(account("account-a"));
    expect(reloaded.getProject("same-project-id")?.name).toBe("Private account project");
  });

  it("fails closed for an authenticated identity with a missing or invalid UID", () => {
    setSession(guest);
    saveProject(project("Guest project"));
    expect(() => setSession({ name: "Invalid", email: "", mode: "firebase" })).toThrow();
    expect(getSession()).toBeNull();
    expect(() => listProjects()).toThrow();
    expect(() => saveProject(project("Overwrite attempt"))).toThrow();
    expect(() => setPrefs({ ...defaultPrefs, language: "az" })).toThrow();
    expect(() => setSession(account(" "))).toThrow();
    setSession(guest);
    expect(getProject("same-project-id")?.name).toBe("Guest project");
  });

  it("does not change storage ownership when callers mutate their session objects", () => {
    const original = account("account-a");
    setSession(original);
    original.uid = "account-b";
    const snapshot = getSession();
    if (snapshot) snapshot.uid = "account-b";
    saveProject(project("Account A project"));
    setSession(account("account-b"));
    expect(listProjects()).toEqual([]);
    setSession(account("account-a"));
    expect(getProject("same-project-id")?.name).toBe("Account A project");
  });
});
