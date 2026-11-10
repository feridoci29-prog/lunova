import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Monitor,
  Smartphone,
  Camera,
  ShoppingBag,
  BarChart3,
  Store,
  ArrowUpRight,
} from "lucide-react";
import { PublicHeader } from "@/components/draftwink/PublicHeader";
import { DemoPreview } from "@/components/draftwink/DemoPreview";
import { TemplateGallery } from "@/components/draftwink/TemplateGallery";
import { HeroBlueLaserBackground } from "@/components/draftwink/HeroBlueLaserBackground";
import { useAuth } from "@/components/lunova/AuthProvider";
import { rememberDraft, readDraft, clearDraft, draftPrompt } from "@/lib/draft-intent";
import type { DemoProjectId } from "@/lib/demo-projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Draftwink — From thought to first draft" },
      {
        name: "description",
        content:
          "Explore a working preview, find a starting point and make your next website or app draft.",
      },
      { property: "og:title", content: "Draftwink — From thought to first draft" },
    ],
  }),
  component: Landing,
});
function Landing() {
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<"website" | "app">("website");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DemoProjectId>("frame");
  const preview = useRef<HTMLElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const saved = readDraft();
    if (saved) {
      setPrompt(saved.prompt);
      setKind(saved.kind);
    }
  }, []);
  const updateIdea = (value: string, nextKind: "website" | "app" = kind) => {
    setPrompt(value);
    setKind(nextKind);
    if (value.trim()) rememberDraft({ prompt: value, kind: nextKind });
    else clearDraft();
  };
  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError("Tell us a little about what you want to make.");
      input.current?.focus();
      return;
    }
    if (loading) return;
    const draft = { prompt: prompt.trim(), kind };
    if (session?.mode === "firebase")
      void navigate({ to: "/workspace", search: { prompt: draftPrompt(draft) } });
    else {
      rememberDraft(draft);
      void navigate({ to: "/signup" });
    }
  };
  const explore = (id: DemoProjectId) => {
    setSelected(id);
    preview.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  };
  const suggestions = [
    {
      label: "Portfolio",
      icon: Camera,
      prompt: "A bold editorial portfolio for a photographer",
      kind: "website",
    },
    {
      label: "Online store",
      icon: ShoppingBag,
      prompt: "A colorful online shop for handmade ceramics",
      kind: "website",
    },
    {
      label: "SaaS dashboard",
      icon: BarChart3,
      prompt: "An analytics dashboard app with an activity chart",
      kind: "app",
    },
    {
      label: "Local business",
      icon: Store,
      prompt: "A warm café website with a menu and contact section",
      kind: "website",
    },
  ] as const;
  return (
    <div className="dw-page">
      <HeroBlueLaserBackground variant="hero" />
      <PublicHeader />
      <main>
        <section className="dw-hero">
          <p className="dw-eyebrow">
            <span /> A NEW WAY TO START
          </p>
          <h1>
            From thought
            <br />
            <span>to first draft.</span>
          </h1>
          <p className="dw-hero-description">
            Describe a website or app. Shape it in one conversation.
          </p>
          <form className="dw-composer" onSubmit={create}>
            <div className="dw-kind-tabs">
              <button
                type="button"
                aria-pressed={kind === "website"}
                onClick={() => updateIdea(prompt, "website")}
              >
                <Monitor size={15} /> Website
              </button>
              <button
                type="button"
                aria-pressed={kind === "app"}
                onClick={() => updateIdea(prompt, "app")}
              >
                <Smartphone size={15} /> App
              </button>
            </div>
            <label htmlFor="draft-idea" className="sr-only">
              Describe your idea
            </label>
            <textarea
              ref={input}
              id="draft-idea"
              value={prompt}
              maxLength={6000}
              onChange={(event) => {
                updateIdea(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="A portfolio for a photographer with a bold, editorial style…"
            />
            <div className="dw-composer-bottom">
              <span className="dw-composer-hint">
                Your idea stays with you
                <br />
                when you sign in.
              </span>
              <button type="submit" className="dw-button" disabled={loading}>
                Create draft <ArrowRight size={16} />
              </button>
            </div>
            {error && (
              <p role="alert" className="dw-composer-error">
                {error}
              </p>
            )}
          </form>
          <div className="dw-suggestions">
            {suggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  updateIdea(item.prompt, item.kind);
                  setError("");
                  input.current?.focus();
                }}
              >
                <item.icon size={13} />
                {item.label}
              </button>
            ))}
          </div>
          <p className="dw-hero-note">Start with an idea. Keep making it yours.</p>
        </section>
        <section className="dw-container dw-section" id="templates">
          <div className="dw-section-heading">
            <div>
              <h2>Find your starting point</h2>
              <p>A few directions. A whole lot of possibility.</p>
            </div>
            <Link to="/templates" className="dw-text-link">
              Explore templates <ArrowRight size={13} />
            </Link>
          </div>
          <TemplateGallery onSelect={explore} />
        </section>
        <section className="dw-container dw-section" id="live-preview" ref={preview}>
          <div className="dw-section-heading">
            <div>
              <h2>Take a look before you leap.</h2>
              <p>A working preview, ready to explore. Your account can wait.</p>
            </div>
            <Link to="/preview" className="dw-text-link">
              Open preview <ArrowUpRight size={14} />
            </Link>
          </div>
          <DemoPreview selected={selected} onSelect={setSelected} />
        </section>
      </main>
      <footer className="dw-footer">
        <span>© {new Date().getFullYear()} Draftwink. Make room for your next idea.</span>
        <span>
          <Link to="/preview">Explore first</Link> &nbsp; · &nbsp; <Link to="/login">Log in</Link>
        </span>
      </footer>
    </div>
  );
}
