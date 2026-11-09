# Draftwink

Draftwink is a preview-first creative workspace built with React 19, TypeScript, TanStack Start and Tailwind CSS. The homepage, interactive templates, preview and pricing work without an account. Firebase sign-in unlocks an account-scoped browser-local workspace with editable source, responsive previews, ZIP export and up to 20 saved versions.

The brand update preserves the existing repository, Firebase project, Worker deployments and `lunova.*` storage keys.

## Local development

Use Node.js 22.12 or newer (Node 24 was tested) and Bun 1.4.4. Install the versions recorded in `bun.lock`:

```sh
bun install --frozen-lockfile
bun run dev
```

Run the checks and production build from the repository root:

```sh
bun run test
bun run typecheck
bun run build
```

The supplied source has existing formatting and lint issues, so `bun run lint` is not currently a passing check.

## Preview the production build

```sh
bun run build
bun run preview
```

Preview uses the pinned local Wrangler installation and `.output/server/wrangler.json` to run the generated Cloudflare Worker with its assets. Rebuild after source changes. The development server is available separately through `bun run dev`.

## Cloudflare Workers deployment

The active site is `https://lunovaa.feridoci29.workers.dev`, deployed from `feridoci29-prog/lunova`, branch `main`, by the existing `lunovaa` Workers Builds integration. The root configuration retains the legacy `lunova` identity; a manual deploy without the active integration’s name override targets that legacy Worker. Do not create or rename Workers for a brand update.

```sh
bun run deploy
```

The deploy script builds the application, then deploys with `.output/server/wrangler.json`. It requires Cloudflare authentication for the account that owns the existing Worker.

For Cloudflare Workers Builds connected to GitHub, use:

| Setting           | Value                    |
| ----------------- | ------------------------ |
| Repository        | `feridoci29-prog/lunova` |
| Production branch | `main`                   |
| Root directory    | `/`                      |
| Build command     | `bun run build`          |
| Deploy command    | `bun run deploy`         |

After a separate successful build, the deploy command can instead be `npx wrangler deploy --config .output/server/wrangler.json`.

The root `wrangler.jsonc` records the Worker name, compatibility date and asset binding. Nitro merges these settings into the generated configuration while pointing the entry and assets at the built output. Keep the `ASSETS` binding and the existing Worker identity when changing deployment settings.

`.output/` and other generated build files are ignored by Git and must be recreated during deployment. Deploy the generated Worker and its `.output/public` assets together; uploading only `public/` or another static subset does not deploy this TanStack Start application.

## Current demo limits

The creation engine is a local, rule-based demo; no AI provider is connected. Google, GitHub and email/password accounts use Firebase Authentication when their providers are configured. Projects and settings use browser-local storage, separated by Firebase UID, with no database, cloud sync, public sharing or payment processing. Guest projects keep their existing local storage. Download projects you want to keep before clearing browser data.

## Firebase Authentication

The client connects to the existing `lunova-90e60` Firebase web application. Google and Email/Password must be enabled in Authentication → Sign-in method. Add each production hostname (currently `lunovaa.feridoci29.workers.dev`) to Authentication → Settings → Authorized domains. `localhost` is also needed for local Google sign-in.

`src/lib/firebase-auth.ts` contains the public Firebase web configuration and initializes Authentication only in the browser. No Admin SDK or service-account credentials belong in this client project. Google and GitHub use popups; email sign-in supports Remember me, registration stores a display name, and password reset uses Firebase's email flow. Firebase owns persisted account identity; old local demo sessions are ignored. Account changes remount workspace state after session restoration so projects cannot be saved into the wrong local account scope.

For GitHub, configure an OAuth App under the existing GitHub account, with homepage `https://lunovaa.feridoci29.workers.dev` and Authorization callback URL `https://lunova-90e60.firebaseapp.com/__/auth/handler`. Enable GitHub in Firebase Authentication → Sign-in method and save the OAuth Client ID and Client Secret there. The secret must stay in Firebase's provider settings, never in this repository or browser code. The client requests only `user:email`, not repository access. A cancelled or failed popup stays on the current form; accounts using a different sign-in method keep Firebase's account-collision protection.

Authentication does not enable database storage, Analytics, payments, sharing or two-factor authentication. The settings screen reports the available account behavior accordingly.

## Draftwink interface

The public homepage and account pages use a lazy-loaded procedural Three.js ribbon with an SVG fallback. Mobile widths, reduced-motion preferences and failed WebGL initialization use the fallback. Desktop animation includes pause/play and stops rendering in background tabs. No external models or textures are loaded. The old space/video assets are no longer rendered.

Generated websites run in opaque-origin sandboxed iframes (`allow-scripts allow-forms`, without `allow-same-origin`). Never grant their code access to application authentication or storage. The todo starter uses in-memory state when preview storage is unavailable.

A prompt survives sign-in in session storage. Account changes remount the workspace; draft storage remains separated by Firebase UID. Code edits create checkpoints; restoration creates a new checkpoint. ZIP exports include template photos with relative image paths. There is no one-click publishing, payment processing, cloud project sync or connected generative AI provider.

The two template photos in `public/demo/` were downloaded from Unsplash under its [license](https://unsplash.com/license): [architecture image](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab) and [interior image](https://images.unsplash.com/photo-1600210492486-724fe5c67fb0). The interface and templates are HTML/CSS, not flattened screenshots.
