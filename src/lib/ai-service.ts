// Typed service boundary for Draftwink's creation engine.
// DEMO: `localEngine` runs a rule-based starter in the browser (no AI, no network).
// PRODUCTION (future): `gatewayEngine` will call a server function that talks to the
// hosted model through a server-side gateway. No API keys ever live in the client.
import type { ProjectFiles, ProjectKind } from "./lunova-store";
import { applyLocalEdit, generateLocal } from "./generator";

export type CreateRequest = { prompt: string; currentFiles?: ProjectFiles };
export type CreateResult = {
  kind: ProjectKind;
  name: string;
  files: ProjectFiles;
  reply: string;
  accent: string;
  changed: boolean;
};
export interface CreationEngine {
  readonly mode: "demo" | "production";
  create(req: CreateRequest): Promise<CreateResult>;
}

export const localEngine: CreationEngine = {
  mode: "demo",
  async create({ prompt, currentFiles }) {
    if (currentFiles) {
      const edit = applyLocalEdit(prompt, currentFiles);
      if (edit)
        return {
          kind: "website",
          name: "",
          files: edit.files,
          reply: edit.note,
          accent: "",
          changed: true,
        };
      return {
        kind: "website",
        name: "",
        files: currentFiles,
        accent: "",
        changed: false,
        reply:
          'In demo mode I can change colours ("make the accent teal"), switch to a dark scheme, or enlarge the heading. For anything else, edit the files directly in the Code tab — full AI edits arrive once the production engine is connected.',
      };
    }
    const g = generateLocal(prompt);
    const what =
      g.kind === "app"
        ? "a small interactive app"
        : g.kind === "document"
          ? "a document draft"
          : "a website starter";
    return {
      ...g,
      changed: true,
      reply: `I created ${what} called “${g.name}”, styled to your request. It's a local starter (demo mode), so review the Preview and refine it in Code.`,
    };
  },
};

/** Placeholder for the future server-side gateway engine. Intentionally not wired. */
export const gatewayEngine: CreationEngine | null = null;

export const engine: CreationEngine = gatewayEngine ?? localEngine;
