# Optimus KB site

Renders `docs/kb/` as a navigable, password-gated website. Hosts throwaway click-through prototypes alongside it. Deployed to Vercel.

## Run locally

```bash
cd kb-site
npm install
SITE_PASSWORD=test npm run dev
# open http://localhost:3000
```

The browser will prompt for credentials. Username is ignored; password is whatever `SITE_PASSWORD` is set to. If `SITE_PASSWORD` is unset, the gate is disabled — useful for local dev without typing a password every load.

The KB itself is read directly from `../docs/kb/` at build time. PNG diagrams are copied into `public/kb-diagrams/` by a `prebuild` script. To pick up changes during development, restart `npm run dev`.

## Adding a prototype

**Vanilla HTML** (preferred — zero build, fully throwaway):

1. Create `public/prototypes/<name>/index.html`. Add additional pages (`step-2.html`, etc.) for click-through flows. Use relative anchor tags to navigate between them.
2. Add an entry to `app/prototypes/page.tsx` linking to `/prototypes/<name>/index.html` so it shows up in the index. (Link to the `index.html` explicitly — Next.js redirects directory-style URLs without trailing slashes and doesn't auto-serve `index.html` for them.)

**React route** (when state, conditional rendering, or shared components are needed):

1. Create `app/prototypes/<name>/page.tsx` as a normal Next page.
2. Add an entry to the index in `app/prototypes/page.tsx`.

## Deploy to Vercel

One-time:

```bash
cd kb-site
vercel link
vercel env add SITE_PASSWORD production
```

In Vercel project settings → set **Root Directory** to `kb-site`.

Then:

```bash
vercel deploy --prod
```

Or hook the repo to Vercel for git-push deploys.

## Project layout

```
kb-site/
├── app/
│   ├── layout.tsx              shell with header + sidebar
│   ├── page.tsx                redirects to /kb
│   ├── kb/
│   │   ├── page.tsx            renders ../docs/kb/index.md
│   │   └── [...slug]/page.tsx  catch-all topic renderer
│   ├── prototypes/
│   │   └── page.tsx            prototype index
│   └── not-found.tsx
├── components/Sidebar.tsx       nav tree from lib/kb.ts
├── lib/
│   ├── kb.ts                    walks ../docs/kb/, builds nav
│   └── markdown.ts              MD → HTML, rewrites links and image paths
├── public/
│   ├── kb-diagrams/             populated by prebuild script (gitignored)
│   └── prototypes/<name>/       vanilla HTML prototypes
├── scripts/copy-diagrams.mjs    copies docs/kb/diagrams/*.png → public/kb-diagrams/
└── middleware.ts                HTTP Basic Auth gate (uses SITE_PASSWORD env)
```

## Notes

- KB updates ship by redeploying — the site is fully static, generated from the markdown at build time.
- `.excalidraw` source files aren't served. Anyone editing diagrams clones the repo and uses the `excalidraw-cli` (per project memory) to re-render the PNG.
- Mobile-friendly is required for the consumer flow per the project's UX requirements; the same applies to this KB site since it'll be read on phones during meetings.
