// Rule-based local starter generator (DEMO). It is NOT AI: it reads keywords from the
// prompt and composes a styled starter in the user's requested style. The real model
// will replace this via src/lib/ai-service.ts.
import type { ProjectFiles, ProjectKind } from "./lunova-store";

type Palette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  font: string;
  display: string;
};

const palettes: Record<string, Palette> = {
  cafe: {
    bg: "#f6efe6",
    surface: "#fffaf3",
    text: "#2b1d14",
    muted: "#7a6352",
    accent: "#a0552d",
    font: "'Work Sans', sans-serif",
    display: "'Playfair Display', serif",
  },
  dark: {
    bg: "#0f0f10",
    surface: "#1a1a1c",
    text: "#f2f2f2",
    muted: "#9a9aa0",
    accent: "#e4ff5c",
    font: "'Work Sans', sans-serif",
    display: "'Space Grotesk', sans-serif",
  },
  minimal: {
    bg: "#ffffff",
    surface: "#f5f5f4",
    text: "#111111",
    muted: "#6b6b6b",
    accent: "#111111",
    font: "'Work Sans', sans-serif",
    display: "'Work Sans', sans-serif",
  },
  colorful: {
    bg: "#fff7ed",
    surface: "#ffffff",
    text: "#1f1235",
    muted: "#6b5b7a",
    accent: "#ff5a36",
    font: "'Work Sans', sans-serif",
    display: "'Space Grotesk', sans-serif",
  },
  nature: {
    bg: "#f1f4ec",
    surface: "#ffffff",
    text: "#1d2a1a",
    muted: "#5d6b57",
    accent: "#3f7a3a",
    font: "'Work Sans', sans-serif",
    display: "'Playfair Display', serif",
  },
};

export function pickPalette(prompt: string): { key: string; p: Palette } {
  const t = prompt.toLowerCase();
  const key = /dark|night|neon|black/.test(t)
    ? "dark"
    : /colou?rful|vibrant|playful|fun|bold/.test(t)
      ? "colorful"
      : /green|nature|garden|plant|eco|yoga/.test(t)
        ? "nature"
        : /caf[eé]|coffee|bakery|restaurant|bistro|food/.test(t)
          ? "cafe"
          : "minimal";
  return { key, p: palettes[key]! };
}

export function detectKind(prompt: string): ProjectKind {
  const t = prompt.toLowerCase();
  if (/\b(document|resume|cv|essay|letter|report|proposal)\b/.test(t)) return "document";
  if (/\b(app|todo|calculator|tracker|timer|tool|game|dashboard)\b/.test(t)) return "app";
  return "website";
}

export function titleFrom(prompt: string) {
  const m = prompt.match(/(?:called|named)\s+["“]?([A-Za-z0-9' ]{2,30})/i);
  if (m) return m[1]!.trim();
  const t = prompt.toLowerCase();
  if (/caf[eé]|coffee/.test(t)) return "Maison Café";
  if (/portfolio/.test(t)) return "Studio Portfolio";
  if (/shop|store/.test(t)) return "Atelier Shop";
  if (/todo/.test(t)) return "Daily Tasks";
  if (/resume|cv/.test(t)) return "Résumé";
  const words = prompt
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 2);
  return words.length
    ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "New Project";
}

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Space+Grotesk:wght@500;700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">`;

const cssBase = (
  p: Palette,
) => `:root{--bg:${p.bg};--surface:${p.surface};--text:${p.text};--muted:${p.muted};--accent:${p.accent}}
*{box-sizing:border-box;margin:0}body{font-family:${p.font};background:var(--bg);color:var(--text);line-height:1.6}
h1,h2,h3{font-family:${p.display};line-height:1.15}a{color:inherit}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.btn{display:inline-block;background:var(--accent);color:var(--bg);padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;border:0;cursor:pointer}
.btn.ghost{background:transparent;color:var(--text);border:1px solid currentColor}`;

export function cafeFiles(name = "Maison Café"): ProjectFiles {
  const p = palettes["cafe"]!;
  return {
    "index.html": `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
${fonts}
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="nav wrap"><strong class="logo">${name}</strong>
<nav><a href="#menu">Menu</a><a href="#story">Story</a><a href="#visit">Visit</a></nav></header>
<section class="hero">
  <div class="wrap hero-in">
    <p class="kicker">Neighbourhood coffee · Since 2014</p>
    <h1>Slow mornings,<br><em>honest coffee.</em></h1>
    <p class="lead">Single-origin espresso, laminated pastries baked at dawn and a sunny corner table waiting for you.</p>
    <div class="cta"><a class="btn" href="#menu">See the menu</a><a class="btn ghost" href="#visit">Find us</a></div>
  </div>
</section>
<section id="menu" class="wrap section">
  <h2>Today's menu</h2>
  <div class="tabs"><button class="tab active" data-cat="coffee">Coffee</button><button class="tab" data-cat="bakery">Bakery</button><button class="tab" data-cat="brunch">Brunch</button></div>
  <ul class="menu" id="menuList"></ul>
</section>
<section id="story" class="story"><div class="wrap"><h2>Our story</h2><p>We roast in small batches every Tuesday and source directly from three family farms in Huila, Sidamo and Minas Gerais.</p></div></section>
<section id="visit" class="wrap section visit">
  <div><h2>Visit us</h2><p>14 Rue des Lilas<br>Mon–Fri 7:00–17:00 · Sat–Sun 8:00–16:00</p></div>
  <form id="reserve"><h3>Reserve a table</h3><input required placeholder="Your name"><input required type="time"><button class="btn">Reserve</button><p id="msg"></p></form>
</section>
<footer class="wrap foot">© ${name}</footer>
<script src="script.js"></script>
</body>
</html>`,
    "style.css": `${cssBase(p)}
.nav{display:flex;justify-content:space-between;align-items:center;padding-top:22px;padding-bottom:22px}
.logo{font-family:${p.display};font-size:1.4rem}.nav nav a{margin-left:22px;text-decoration:none;color:var(--muted)}
.hero{background:linear-gradient(120deg,#ead9c4,#f6efe6);padding:90px 0 110px}
.kicker{text-transform:uppercase;letter-spacing:.2em;font-size:.75rem;color:var(--accent)}
.hero h1{font-size:clamp(2.6rem,6vw,4.6rem);margin:14px 0}.hero em{color:var(--accent)}
.lead{max-width:520px;color:var(--muted);font-size:1.1rem}.cta{display:flex;gap:12px;margin-top:28px}
.section{padding:80px 24px}.section h2,.story h2{font-size:2.2rem;margin-bottom:22px}
.tabs{display:flex;gap:8px;margin-bottom:22px}.tab{background:var(--surface);border:1px solid #e3d5c4;padding:8px 16px;border-radius:999px;cursor:pointer;font:inherit}
.tab.active{background:var(--text);color:var(--bg)}
.menu{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.menu li{background:var(--surface);padding:18px;border-radius:16px;display:flex;justify-content:space-between;box-shadow:0 8px 24px -16px #6b4a2f55}
.menu span{color:var(--accent);font-weight:600}
.story{background:var(--text);color:var(--bg);padding:80px 0}.story p{max-width:620px;opacity:.85}
.visit{display:grid;grid-template-columns:1fr 1fr;gap:40px}
form{background:var(--surface);padding:24px;border-radius:18px;display:grid;gap:10px}
input{padding:12px;border-radius:10px;border:1px solid #e3d5c4;font:inherit}
#msg{color:var(--accent);font-size:.9rem}.foot{padding:30px 24px;color:var(--muted);font-size:.85rem}
@media(max-width:700px){.visit{grid-template-columns:1fr}.nav nav{display:none}}`,
    "script.js": `const items = {
  coffee: [["Espresso", "3.00"], ["Flat white", "4.20"], ["Oat cortado", "4.00"], ["Filter of the day", "3.80"]],
  bakery: [["Butter croissant", "3.20"], ["Pain au chocolat", "3.50"], ["Cardamom bun", "3.90"]],
  brunch: [["Avocado sourdough", "11.00"], ["Shakshuka", "12.50"], ["Granola bowl", "8.50"]],
};
const list = document.getElementById("menuList");
function render(cat) {
  list.innerHTML = items[cat].map(([n, p]) => \`<li>\${n}<span>€\${p}</span></li>\`).join("");
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
  t.classList.add("active"); render(t.dataset.cat);
}));
render("coffee");
document.getElementById("reserve").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("msg").textContent = "Thank you! Your table is noted (demo).";
});`,
    "README.md": `# ${name}\n\nStatic HTML/CSS/JS site created in Draftwink. Open index.html in a browser.`,
  };
}

function websiteFiles(prompt: string, name: string): ProjectFiles {
  const { key, p } = pickPalette(prompt);
  if (key === "cafe") return cafeFiles(name);
  return {
    "index.html": `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title>${fonts}<link rel="stylesheet" href="style.css"></head>
<body>
<header class="wrap nav"><strong>${name}</strong><a class="btn" href="#contact">Get in touch</a></header>
<section class="wrap hero"><h1>${name}</h1><p>${prompt.replace(/</g, "&lt;")}</p><a class="btn" href="#features">Explore</a></section>
<section id="features" class="wrap grid">
  <article><h3>Thoughtful</h3><p>Designed around what your visitors actually need.</p></article>
  <article><h3>Fast</h3><p>Lightweight static pages that load instantly.</p></article>
  <article><h3>Yours</h3><p>Edit every line of code in the Code tab.</p></article>
</section>
<section id="contact" class="wrap contact"><h2>Say hello</h2><form id="f"><input required type="email" placeholder="you@example.com"><button class="btn">Send</button></form><p id="msg"></p></section>
<script src="script.js"></script></body></html>`,
    "style.css": `${cssBase(p)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:24px}
.hero{padding:100px 24px}.hero h1{font-size:clamp(2.6rem,7vw,5rem)}.hero p{max-width:560px;color:var(--muted);margin:18px 0 28px;font-size:1.1rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding-bottom:80px}
.grid article{background:var(--surface);padding:24px;border-radius:18px}.grid p{color:var(--muted)}
.contact{padding:60px 24px 100px}form{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
input{padding:12px 14px;border-radius:999px;border:1px solid var(--muted);background:var(--surface);color:var(--text);font:inherit;min-width:240px}
#msg{margin-top:10px;color:var(--accent)}`,
    "script.js": `document.getElementById("f").addEventListener("submit", (e) => {\n  e.preventDefault();\n  document.getElementById("msg").textContent = "Thanks — we'll be in touch.";\n});`,
    "README.md": `# ${name}\n\nPrompt: ${prompt}`,
  };
}

function appFiles(prompt: string, name: string): ProjectFiles {
  const { p } = pickPalette(prompt);
  return {
    "index.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title>${fonts}<link rel="stylesheet" href="style.css"></head>
<body><main class="app"><h1>${name}</h1><form id="add"><input id="txt" placeholder="Add an item…" required><button class="btn">Add</button></form><ul id="list"></ul><p class="count" id="count"></p></main><script src="script.js"></script></body></html>`,
    "style.css": `${cssBase(p)}
.app{max-width:520px;margin:60px auto;background:var(--surface);padding:32px;border-radius:22px;box-shadow:0 20px 60px -30px #0005}
h1{font-size:2rem;margin-bottom:18px}form{display:flex;gap:8px}input{flex:1;padding:12px;border-radius:12px;border:1px solid var(--muted);background:var(--bg);color:var(--text);font:inherit}
ul{list-style:none;padding:0;margin-top:18px}li{display:flex;gap:10px;align-items:center;padding:12px 4px;border-bottom:1px solid #8883}
li.done span{text-decoration:line-through;opacity:.5}li button{margin-left:auto;background:none;border:0;color:var(--muted);cursor:pointer}.count{color:var(--muted);margin-top:12px;font-size:.9rem}`,
    "script.js": `const KEY = "items";
let items = [];
try { const saved = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(saved)) items = saved; } catch { /* Sandboxed previews keep tasks in memory. */ }
const list = document.getElementById("list");
function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* The preview has no persistent storage. */ } render(); }
function render() {
  list.innerHTML = "";
  items.forEach((it, i) => {
    const li = document.createElement("li"); li.className = it.done ? "done" : "";
    li.innerHTML = \`<input type="checkbox" \${it.done ? "checked" : ""}><span></span><button aria-label="Remove">✕</button>\`;
    li.querySelector("span").textContent = it.text;
    li.querySelector("input").onchange = () => { it.done = !it.done; save(); };
    li.querySelector("button").onclick = () => { items.splice(i, 1); save(); };
    list.appendChild(li);
  });
  document.getElementById("count").textContent = items.filter((x) => !x.done).length + " remaining";
}
document.getElementById("add").onsubmit = (e) => { e.preventDefault(); const t = document.getElementById("txt"); items.push({ text: t.value, done: false }); t.value = ""; save(); };
render();`,
  };
}

function documentFiles(prompt: string, name: string): ProjectFiles {
  const md = `# ${name}\n\n_Draft outline generated from your request:_ "${prompt}"\n\n## Summary\nWrite a short, confident summary here.\n\n## Section one\n- Key point\n- Supporting detail\n\n## Section two\nExpand with specifics and examples.\n\n## Next steps\n1. Review\n2. Refine\n3. Share`;
  return {
    "document.md": md,
    "index.html": `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${name}</title>${fonts}<link rel="stylesheet" href="style.css"></head><body><article id="doc"></article><script src="script.js"></script></body></html>`,
    "style.css": `body{font-family:'Work Sans',sans-serif;background:#f4f4f2;color:#1b1b1b;margin:0}#doc{max-width:720px;margin:40px auto;background:#fff;padding:56px 64px;border-radius:6px;box-shadow:0 10px 40px -20px #0004;line-height:1.7}h1,h2{font-family:'Playfair Display',serif}h1{font-size:2.4rem}h2{margin-top:28px}`,
    "script.js": `const md = ${JSON.stringify(md)};\nconst html = md.split("\\n").map(l => l.startsWith("## ") ? "<h2>"+l.slice(3)+"</h2>" : l.startsWith("# ") ? "<h1>"+l.slice(2)+"</h1>" : /^[-\\d]/.test(l) ? "<p>• "+l.replace(/^(-|\\d\\.)\\s*/, "")+"</p>" : l ? "<p>"+l.replace(/_(.+)_/, "<em>$1</em>")+"</p>" : "").join("");\ndocument.getElementById("doc").innerHTML = html;`,
  };
}

export function generateLocal(prompt: string) {
  const kind = detectKind(prompt);
  const name = titleFrom(prompt);
  const { p } = pickPalette(prompt);
  const files =
    kind === "app"
      ? appFiles(prompt, name)
      : kind === "document"
        ? documentFiles(prompt, name)
        : websiteFiles(prompt, name);
  return { kind, name, files, accent: p.accent, bg: p.bg };
}

/** Simple local edit rules applied to an existing project (demo). */
export function applyLocalEdit(
  prompt: string,
  files: ProjectFiles,
): { files: ProjectFiles; note: string } | null {
  const t = prompt.toLowerCase();
  const css = files["style.css"];
  if (!css) return null;
  const color = t.match(
    /(?:accent|color|colour|button).*?(#[0-9a-f]{3,6}|red|blue|green|orange|black|pink|teal|gold)/,
  );
  if (color) {
    if (!/--accent:[^;]+;/.test(css)) return null;
    const map: Record<string, string> = {
      red: "#c0392b",
      blue: "#2563eb",
      green: "#2f7a3a",
      orange: "#e8692c",
      black: "#111111",
      pink: "#d6457a",
      teal: "#118080",
      gold: "#b8892f",
    };
    const val = map[color[1]!] ?? color[1];
    return {
      files: { ...files, "style.css": css.replace(/--accent:[^;]+;/, `--accent:${val};`) },
      note: `Updated the accent colour to ${val} in style.css.`,
    };
  }
  if (/dark/.test(t)) {
    if (!/--bg:[^;]+;/.test(css)) return null;
    const d = palettes["dark"]!;
    return {
      files: {
        ...files,
        "style.css": css
          .replace(/--bg:[^;]+;/, `--bg:${d.bg};`)
          .replace(/--surface:[^;]+;/, `--surface:${d.surface};`)
          .replace(/--text:[^;]+;/, `--text:${d.text};`)
          .replace(/--muted:[^;]+;/, `--muted:${d.muted};`),
      },
      note: "Switched the base colours to a dark scheme in style.css.",
    };
  }
  if (/bigger|larger/.test(t) && /title|heading|headline/.test(t)) {
    return {
      files: { ...files, "style.css": css + "\nh1{font-size:clamp(3rem,8vw,6rem)!important}" },
      note: "Made the main heading larger.",
    };
  }
  return null;
}
