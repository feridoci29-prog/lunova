# LUNOVA — Cinematic AI Studio for Websites & Digital Experiences

> **Ideas into reality.** A premium, cinematic platform for generating, editing, and exporting complete websites, web applications, and project files.

---

## ✦ Platform Overview

**LUNOVA** is a fully functional web platform engineered with a dark cinematic aesthetic, frosted glassmorphism, celestial cosmic depth, and a unified workspace that bridges conversational code generation with a live sandboxed runtime, interactive code editor, file manager, and real client-side ZIP packaging.

### Core Visual Atmosphere
- **Cosmic Palette**: Deep void black (`#03050a`), galactic navy (`#050814`), and celestial ice blue (`#38bdf8`, `#7dd3fc`).
- **Celestial Background**: Real-time canvas starfield with drifting stellar dust, a glowing radiant moon in the top-right, and a curved planetary horizon at the bottom.
- **Glassmorphic Paneling**: Multi-layered frosted glass panels (`backdrop-filter: blur(20px)`), subtle borders, and soft ice-blue shadows.
- **Typography & Accessibility**: Clean geometric typography (`Plus Jakarta Sans`, `Jost`, `JetBrains Mono`), high-contrast text, visible focus rings, and WCAG-compliant readability.

---

## 🚀 Quick Start Guide

You can launch and run LUNOVA in any of the following ways:

### Option 1: Direct Browser Launch (Zero Installation)
Simply open the `lunova` folder in Windows Explorer and double-click:
```
index.html
```
The entire application runs 100% offline and stores state in your browser's persistent `localStorage`.

### Option 2: Windows Batch Launcher
Double-click:
```
run.bat
```
This automatically starts a local Node.js server and launches `http://localhost:3000` in your default browser.

### Option 3: Terminal Command
Run inside `C:\Users\user\.gemini\antigravity\scratch\lunova`:
```bash
npm start
```
Then visit [http://localhost:3000](http://localhost:3000).

---

## 🌟 Feature Tour & Screens

### 1. Landing Screen
- **Celestial Cosmos**: Glowing moon with crater depth and sweeping planetary horizon.
- **Hero Presentation**: "Build your website with AI." with ice-blue radiant glow.
- **Glass Sign-up Card**: Direct Google, GitHub, Email authentication mockups, and "Explore as a guest — demo".
- **4 Core Pillars**: AI Powered, Modern Templates, Editable Code, and Create & Share.

### 2. Login Screen
- "Continue your vision" greeting.
- Email, password with toggle visibility (👁️), "Remember me", and "Forgot password" modal.
- Transparent demo disclaimer.

### 3. Signup Screen
- "Every idea deserves orbit" registration.
- Full name, email, password strength confirmation, and client-side privacy disclosure.

### 4. Dashboard
- Darker internal space atmosphere.
- Wide glass prompt composer with quick-start chips (Café, Portfolio, Todo App, Résumé).
- Real-time local storage usage gauge (e.g. `X KB / 5.0 MB`).
- Quick access to recent projects and featured templates.

### 5. Unified Workspace (The Core Studio)
- **Chat Panel (Left)**: Project switcher, conversational synthesis history, multiline prompt box (Enter to send, Shift+Enter for newline), and real-time generation step logs.
- **Project Panel (Right)**:
  - **Preview Tab**: Sandboxed iframe rendering live HTML, CSS, and JS with Desktop (100%), Tablet (768px), and Mobile (375px) responsive frames.
  - **Code Tab**: In-browser code editor with line numbers, syntax styling, Ctrl+S save shortcut, unsaved changes tracker, and single-file download.
  - **Files Tab**: File tree with size in KB, new file creation, deletion, and whole-project download.
  - **Download ZIP**: Uses a built-in, pure JavaScript PKZIP engine (`zip.js`) to generate valid, standard `.zip` files that extract natively on Windows Explorer, macOS, and Linux!

### 6. Projects Screen
- Complete project library with search filtering.
- Open in workspace, rename, duplicate, toggle shared showcase, and delete (with double confirmation).

### 7. Curated Blueprints (9 Full Production Templates)
1. **Aura Artisan Café & Bistro** (Business) — Menu tabs, reservation modal, photo grid, hours.
2. **Kaelen Voss Creative Technologist** (Creative) — Dark spatial tech portfolio, dynamic project filter, skills, contact drawer.
3. **Lumina Audio Precision Sound** (E-Commerce) — Working cart drawer, dynamic price calculator, category filter.
4. **PulseOps Cloud Metrics Platform** (Tech) — Live telemetry canvas chart with real-time query rendering.
5. **ZenTask Minimal Productivity** (Web App) — Full task manager with category tags, completion status, and active filters.
6. **Prana Sanctuary Mindful Living** (Lifestyle) — Guided breathing circle animation and class schedule booking.
7. **Elena Rostova Principal Designer** (Résumé) — Interactive career timeline and print-ready stylesheet.
8. **Crumb & Crust Boulangerie** (Bakery) — Daily oven bake countdown timer and pastry showcase.
9. **NovaCon 2027 Tech Summit** (Event) — Live countdown clock and ticket tier selector.

### 8. Pricing Screen
- Starter ($0), Creator Pro ($24/mo or $19/mo annual), and Studio Team ($59/mo or $48/mo annual).
- Monthly vs Annual toggle (Save 20%).
- Honest demo disclaimer and interactive FAQ accordion.

### 9. Settings Screen
- Profile identity editing.
- Appearance: Reduced motion toggle and code editor font scale (Small, Medium, Large).
- Data Sandbox: Complete JSON backup export and restore, plus safe local data reset.

### 10. Shared Collection
- Local presentation collection of starred projects with instant workspace access.

---

## 📁 Project Structure

```
lunova/
├── index.html       # Complete application interface and view screens
├── style.css        # Cinematic cosmic styles, glassmorphism, and responsive layout
├── app.js           # Router, state controller, code editor, and live sandbox
├── generator.js     # Intelligent client-side code synthesis engine
├── templates.js     # 9 production blueprints with working code
├── zip.js           # Self-contained PKZIP archive builder (zero dependencies)
├── server.js        # Lightweight Node.js static file server
├── run.bat          # 1-click Windows launcher
├── package.json     # Node.js project manifest
└── README.md        # Documentation and feature guide
```

---

## ✦ Brand & Integrity Standards
- **No Third-Party Builder Badges**: Independent LUNOVA branding throughout.
- **No Fake AI Claiming**: Transparent disclosure of local deterministic code synthesis.
- **Zero Security Risk**: No sensitive credentials or passwords sent to external APIs.
- **100% Offline Capable**: Runs completely offline without internet connection.
