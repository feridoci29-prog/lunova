import { beforeEach, describe, expect, it } from "vitest";
import {
  getProject,
  restoreProjectVersion,
  saveProject,
  saveProjectRevision,
  setSession,
  type Project,
} from "@/lib/lunova-store";

const project = (): Project => ({
  id: "draft",
  name: "My draft",
  kind: "website",
  files: { "index.html": "first" },
  messages: [],
  updatedAt: 1,
  accent: "#91b8ff",
});
beforeEach(() => {
  localStorage.clear();
  setSession(null);
});

describe("local project history", () => {
  it("adds immutable content snapshots while preserving old projects without history", () => {
    const old = project();
    saveProject(old);
    const saved = saveProjectRevision(old, "First draft");
    saved.files["index.html"] = "unsaved change";
    expect(saved.versions?.[0]?.files["index.html"]).toBe("first");
    expect(getProject("draft")?.versions?.[0]?.summary).toBe("First draft");
    expect(getProject("draft")?.files["index.html"]).toBe("first");
  });

  it("restores a version's actual files and records the restoration", () => {
    const first = saveProjectRevision(project(), "First draft");
    const firstVersion = first.versions![0]!.id;
    saveProjectRevision(
      { ...first, name: "Updated draft", files: { "index.html": "second" } },
      "Changed headline",
    );
    const restored = restoreProjectVersion("draft", firstVersion);
    expect(restored?.name).toBe("My draft");
    expect(restored?.files["index.html"]).toBe("first");
    expect(restored?.versions?.[0]?.summary).toContain("Restored");
    expect(restored?.versions).toHaveLength(3);
  });

  it("caps retained history and excludes recursive versions from snapshots", () => {
    let current = project();
    for (let i = 0; i < 25; i++)
      current = saveProjectRevision(
        { ...current, files: { "index.html": String(i) } },
        `Edit ${i}`,
      );
    expect(current.versions).toHaveLength(20);
    expect(current.versions?.[0]?.files["index.html"]).toBe("24");
    expect(current.versions?.[0]).not.toHaveProperty("versions");
  });

  it("cannot restore another account's history with the same project ID", () => {
    setSession({ uid: "a", name: "A", email: "a@example.com", mode: "firebase" });
    const saved = saveProjectRevision(project(), "A's draft");
    setSession({ uid: "b", name: "B", email: "b@example.com", mode: "firebase" });
    expect(restoreProjectVersion("draft", saved.versions![0]!.id)).toBeNull();
    expect(getProject("draft")).toBeUndefined();
    saveProject(project());
    expect(restoreProjectVersion("draft", saved.versions![0]!.id)).toBeNull();
  });
});
