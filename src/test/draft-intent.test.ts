import { afterEach, describe, expect, it } from "vitest";
import { rememberDraft, readDraft, clearDraft, draftPrompt } from "@/lib/draft-intent";
afterEach(clearDraft);
describe("draft continuation", () => {
  it("preserves the prompt and project kind without account data", () => {
    rememberDraft({ prompt: "  A study tracker  ", kind: "app" });
    expect(readDraft()).toEqual({ prompt: "A study tracker", kind: "app" });
    expect(draftPrompt(readDraft()!)).toBe("Create an app: A study tracker");
    clearDraft();
    expect(readDraft()).toBeNull();
  });
  it("rejects empty or oversized prompts", () => {
    expect(() => rememberDraft({ prompt: "  ", kind: "website" })).toThrow();
    expect(() => rememberDraft({ prompt: "x".repeat(6001), kind: "website" })).toThrow();
    expect(readDraft()).toBeNull();
  });
});
