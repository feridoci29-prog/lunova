# LUNOVA — Interactive MVP Prototype

LUNOVA is a single-chat creative workspace concept for building websites, code and project files. This repository contains a **static, interactive prototype** implementing the ten agreed screens with a dark space-themed visual system.

## What works today

- Landing, Sign Up, Login, Dashboard, AI Workspace, My Projects, Templates, Pricing, Settings and Shared Projects screens.
- Sidebar navigation and responsive layouts.
- A **local, rule-based starter website generator** for demonstration (not yet AI).
- Separate editable HTML, CSS and JavaScript source.
- Sandboxed live website preview using an iframe **without** `allow-same-origin`.
- Local project storage (browser localStorage).
- Downloading projects as a ZIP file containing `index.html`, `styles.css`, `script.js`, and `README.md`.
- Demonstration templates; local profile settings.

## Not connected yet (important)

- **No Gemma API or other AI provider is connected.** The current starter generator is deliberately labelled "Prototype" in the UI.
- **No real Google, GitHub or email account sign-in.** The forms enter demo mode; passwords are not stored.
- No real backend/database, user accounts, cloud sync, public sharing, collaboration, live publishing, or payment processing.
- No secure server-side code execution for arbitrary Python/Node apps.
- The pricing cards are illustrative; no paid plans have been activated.
- The screenshots are **visual design references**. This first coded version is an approximation of their style, not yet pixel-perfect.

## Try locally

Open `index.html` in a modern browser. For a normal local development URL, serve the repository with any static HTTP server (for example Python's `python -m http.server 8080`), then open `http://localhost:8080`.

No package installation or API key is needed for the demo.

## Publish the prototype for free

In Cloudflare Pages, create a project connected to this GitHub repository:

- Production branch: `main`
- Framework preset: **None**
- Build command: leave blank (static files)
- Build output directory: `.` (repository root)

You can use the temporary `*.pages.dev` URL first. **Do not purchase or connect a paid .com domain until its availability, renewal cost and terms are verified.**

## Next engineering tasks

1. Implement real authentication using a suitable backend (e.g. Supabase Auth), including redirect settings and access-control policies.
2. Add a server-side AI gateway. **Never expose API keys in the browser, source code, or GitHub.** Verify age/eligibility and provider terms with the responsible adult account holder before use.
3. Define an agent flow to plan tasks and create/update files; show model failures honestly.
4. Implement safe previews per supported framework. Arbitrary generated code requires strong isolation and abuse prevention; an iframe alone is not sufficient for server-side execution.
5. Add real cloud project storage, versions, quotas, data privacy controls, domain publishing, and collaboration.
6. Test the entire app (including mobile, accessibility, browsers, abuse cases, and actual AI calls) before opening it publicly.

## Current files

- `index.html` — app entry point
- `styles.css` — responsive design
- `app.js` — demo navigation, local project generation, editor, sandbox preview and ZIP export

## Warning

All user projects in this prototype are saved **only on that browser**. Clearing site data or using another device removes access unless you have downloaded ZIP backups. This is not a production service.
