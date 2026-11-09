// Static demo catalog: templates + illustrative sample content.
export type Template = { id: string; name: string; category: string; prompt: string; bg: string; ink: string; accent: string; tagline: string };

export const templates: Template[] = [
  { id: "cafe", name: "Maison Café", category: "Restaurants", prompt: "A warm café website called Maison Café with menu tabs and table reservations", bg: "#f6efe6", ink: "#2b1d14", accent: "#a0552d", tagline: "Slow mornings, honest coffee." },
  { id: "portfolio", name: "Studio Portfolio", category: "Portfolio", prompt: "A minimal portfolio website for a product designer", bg: "#ffffff", ink: "#111111", accent: "#111111", tagline: "Selected work, 2019–2026" },
  { id: "shop", name: "Atelier Shop", category: "E-commerce", prompt: "A colorful online shop landing page for handmade ceramics", bg: "#fff7ed", ink: "#1f1235", accent: "#ff5a36", tagline: "Handmade in small batches" },
  { id: "saas", name: "Nightshift", category: "SaaS", prompt: "A dark SaaS landing page called Nightshift for a developer tool", bg: "#0f0f10", ink: "#f2f2f2", accent: "#e4ff5c", tagline: "Ship while you sleep." },
  { id: "yoga", name: "Greenroom Yoga", category: "Wellness", prompt: "A calm green nature website for a yoga studio called Greenroom", bg: "#f1f4ec", ink: "#1d2a1a", accent: "#3f7a3a", tagline: "Breathe. Stretch. Belong." },
  { id: "todo", name: "Daily Tasks", category: "Apps", prompt: "A simple todo app with local saving", bg: "#ffffff", ink: "#111111", accent: "#2563eb", tagline: "Get the day done" },
  { id: "resume", name: "Résumé", category: "Documents", prompt: "A professional resume document for a marketing manager", bg: "#f4f4f2", ink: "#1b1b1b", accent: "#1b1b1b", tagline: "Experience · Skills · Education" },
  { id: "bakery", name: "Rye & Butter", category: "Restaurants", prompt: "A bakery website called Rye & Butter with a daily menu", bg: "#f6efe6", ink: "#2b1d14", accent: "#b8892f", tagline: "Baked before sunrise" },
  { id: "event", name: "Summit 26", category: "Events", prompt: "A colorful bold event landing page called Summit 26 for a design conference", bg: "#fff7ed", ink: "#1f1235", accent: "#d6457a", tagline: "Two days. One big idea." },
];

export const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];

export const examplePrompts = [
  "A café website with a menu and reservations",
  "A todo app that saves locally",
  "A minimal portfolio for a photographer",
  "A resume document for a designer",
];
