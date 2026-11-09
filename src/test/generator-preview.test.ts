import { afterEach, describe, expect, it } from "vitest";
import { applyLocalEdit, generateLocal } from "@/lib/generator";
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  document.body.innerHTML = "";
});
describe("isolated local starter preview", () => {
  it("keeps task interactions working when storage access throws", () => {
    const generated = generateLocal("A simple todo app");
    document.body.innerHTML =
      '<form id="add"><input id="txt"></form><ul id="list"></ul><p id="count"></p>';
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Opaque origin", "SecurityError");
      },
    });
    new Function(generated.files["script.js"]!)();
    (document.getElementById("txt") as HTMLInputElement).value = "My first task";
    document.getElementById("add")!.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(document.getElementById("list")).toHaveTextContent("My first task");
    expect(document.getElementById("count")).toHaveTextContent("1 remaining");
    document.querySelector<HTMLButtonElement>("li button")!.click();
    expect(document.getElementById("count")).toHaveTextContent("0 remaining");
  });
  it("does not claim color or theme edits when a template has no corresponding variables", () => {
    expect(
      applyLocalEdit("Make the buttons blue", { "style.css": "body{color:white}" }),
    ).toBeNull();
    expect(applyLocalEdit("Switch to dark", { "style.css": "body{color:white}" })).toBeNull();
  });
});
