export type DraftIntent = { prompt: string; kind: "website" | "app" };

const storageKey = "draftwink.draft-intent";
const maxPromptLength = 6000;
let memoryDraft: DraftIntent | null = null;

function parseDraft(value: unknown): DraftIntent | null {
  if (!value || typeof value !== "object") return null;
  const draft = value as Partial<DraftIntent>;
  if (draft.kind !== "website" && draft.kind !== "app") return null;
  if (typeof draft.prompt !== "string") return null;
  const prompt = draft.prompt.trim();
  if (!prompt || prompt.length > maxPromptLength) return null;
  return { prompt, kind: draft.kind };
}

/** Preserve a creative request across the sign-in step, never credentials. */
export function rememberDraft(draft: DraftIntent) {
  if (typeof window === "undefined") return;
  const next = parseDraft(draft);
  if (!next) throw new Error("Enter an idea of up to 6,000 characters.");
  memoryDraft = next;
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // In-memory navigation still works when browser storage is unavailable.
  }
}

export function readDraft(): DraftIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return parseDraft(JSON.parse(saved));
    return memoryDraft;
  } catch {
    return memoryDraft;
  }
}

export function clearDraft() {
  memoryDraft = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* Storage may be blocked. */
  }
}

export function draftPrompt(draft: DraftIntent) {
  return draft.kind === "app" ? `Create an app: ${draft.prompt}` : draft.prompt;
}
