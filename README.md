## AI-Assisted WYSIWYG Content Authoring Platform

A WYSIWYG page builder for marketing pages, built with **React**, **Next.js (App Router)**, and **TypeScript**. Authors assemble pages from content blocks in a visual editor, get LLM-generated copy suggestions inline, and publish to a server-rendered public URL.

### Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Request flow](#request-flow)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Getting started](#getting-started)
- [AI suggestions](#ai-suggestions)
- [API reference](#api-reference)

### Features

- **WYSIWYG page builder** — add, remove, and reorder (native HTML5 drag & drop) content blocks — hero, heading, text, image, button — with inline field editing and a live preview panel rendered from the same component used in production.
- **Server-side rendering** — published marketing pages (`/[slug]`) are React Server Components that read page data directly on the server and render full HTML on each request — no client-side data fetching or hydration mismatch risk for the public page.
- **AI-assisted authoring** — an "AI Suggest" action on any text-bearing block (hero heading, heading, paragraph, button label) calls an LLM to propose 3 alternative copy variants, which the author can apply with one click.
- **Publishing workflow** — pages are edited as drafts and explicitly published. Publishing persists the change and calls Next.js `revalidatePath` so the live SSR route reflects the new content immediately, without a redeploy or cache wait.

### Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Route handlers double as the API layer; React Server Components give real SSR for the public page without a separate backend. |
| Language | TypeScript | Blocks are a tagged union (`Block["type"]`); the compiler enforces that every block renderer and editor field stays in sync with the schema. |
| UI | React 19 + Tailwind CSS v4 | Utility classes keep the editor/preview styling colocated with markup; no separate design-token build step needed for this scope. |
| AI | Hugging Face Inference API (free tier, default model `HuggingFaceH4/zephyr-7b-beta`) | Suggestion generation is isolated behind one function (`generateSuggestions`) so the model/provider can change without touching UI or API code. |
| Persistence | JSON file (`data/pages.json`) via Node `fs` | Deliberately minimal — no database to provision for a project whose focus is the editor and AI-assist UX, not storage infrastructure. Swappable behind `src/lib/store.ts`. |

### Architecture

```
┌─────────────────┐      fetch       ┌──────────────────────┐
│  Editor (client) │ ───────────────▶│ /api/pages/[id]       │  PUT  (save draft)
│  src/components/ │                 │ /api/pages/[id]/publish│ POST (publish + revalidate)
│  Editor.tsx      │ ◀─────────────── │ /api/ai/suggest        │ POST (AI copy suggestions)
└─────────────────┘      JSON        └──────────┬───────────┘
                                                  │ reads/writes
                                                  ▼
                                        data/pages.json (store.ts)
                                                  ▲
                                                  │ reads (server-side, no HTTP)
┌─────────────────┐                    ┌─────────┴──────────┐
│ Public visitor   │ ─── GET /slug ───▶│ /[slug]/page.tsx    │  Server Component → SSR HTML
└─────────────────┘                    └─────────────────────┘
```

Two read paths intentionally differ:
- The **editor** is a client component that talks to the store through HTTP API routes, because it needs interactive round-trips (save, publish, AI suggest) driven by user actions.
- The **public page** is a Server Component that calls `getPageBySlug` directly, in-process, with no HTTP hop — this is what makes it genuine SSR rather than a client-rendered page that happens to fetch data first.

### Data model

```ts
type Block =
  | { id: string; type: "hero";    props: { heading: string; subheading: string; imageUrl: string } }
  | { id: string; type: "heading"; props: { text: string; level: 1 | 2 | 3 } }
  | { id: string; type: "text";    props: { text: string } }
  | { id: string; type: "image";   props: { url: string; alt: string } }
  | { id: string; type: "button";  props: { label: string; href: string } };

interface Page {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  blocks: Block[];
  updatedAt: string;
}
```

`Block` is a discriminated union keyed on `type`. `BlockRenderer` (`src/components/BlockRenderer.tsx`) switches on that key to render each block's read view, and `Editor.tsx`'s `BlockEditor` switches on it to render the matching input fields — adding a new block type means extending the union and both switch statements, with TypeScript flagging any case left unhandled.

### Request flow

**Editing and publishing a page**
1. `GET /` (dashboard) lists all pages from the store.
2. `POST /api/pages` creates a page (id, slug, empty block list, `status: "draft"`).
3. The editor (`/editor/[id]`) loads the page server-side, then all further edits happen client-side in React state.
4. **Save Draft** → `PUT /api/pages/[id]` persists `title` + `blocks` to `data/pages.json`.
5. **Publish** → saves, then `POST /api/pages/[id]/publish` sets `status: "published"` and calls `revalidatePath('/{slug}')`, invalidating the cached render of the public route.
6. A visitor hitting `/{slug}` gets a freshly server-rendered page reflecting the latest published blocks.

**Getting an AI suggestion**
1. Author clicks "AI Suggest" on a block → client posts `{ blockType, currentText, pageTitle }` to `/api/ai/suggest`.
2. `generateSuggestions()` (`src/lib/ai.ts`) calls the free Hugging Face Inference API with a prompt asking for 3 newline-separated copy variants in the same voice/length as the current text.
3. If `HUGGINGFACE_API_KEY` is unset, the request fails, or the response can't be parsed into suggestions, the function falls back to static per-block-type sample suggestions — the authoring flow never breaks due to missing credentials or a model hiccup.
4. The author clicks a suggestion to apply it directly to the block's editable field; nothing is persisted until they hit Save/Publish.

### Project structure

```
src/
  app/
    page.tsx                     dashboard: list + create pages
    editor/[id]/page.tsx         loads a page, renders <Editor>
    [slug]/page.tsx              public SSR marketing page
    api/
      pages/route.ts             list, create
      pages/[id]/route.ts        get, update
      pages/[id]/publish/route.ts  publish + revalidate
      ai/suggest/route.ts        AI copy suggestions
  components/
    Editor.tsx                   the WYSIWYG canvas: add/reorder/edit/remove blocks
    BlockRenderer.tsx             read-only render of a block (shared: preview + public page)
    AISuggestButton.tsx           fetches + applies AI suggestions for one block
    NewPageForm.tsx               create-page form on the dashboard
  lib/
    types.ts                     Block / Page types
    store.ts                     JSON-file persistence
    ai.ts                        LLM call + mock fallback
    id.ts                        client-side id generator for new blocks
data/
  pages.json                     generated at runtime, gitignored
```

### Design decisions

- **File-backed store instead of a database.** The interesting problems here are the editor UX and the AI-assist integration, not schema design or query performance — `store.ts` exposes the exact same shape (`listPages`, `getPage`, `createPage`, `updatePage`, `setPageStatus`) a real database-backed implementation would, so swapping in Postgres/Prisma later only touches that one file.
- **Native HTML5 drag-and-drop instead of a DnD library.** Reordering a flat list of blocks doesn't need nested containers, virtualization, or cross-list drag — `draggable`/`onDragOver`/`onDrop` on each block row is enough, avoiding an extra dependency for a problem this small.
- **Shared `BlockRenderer` between editor preview and public page.** The live preview in the editor and the actual published page render through the same component, so what the author sees while editing is what gets published — no separate "preview renderer" that can drift from production output.
- **AI suggestions behind one function with a built-in fallback**, rather than assuming an API key is always configured. This keeps the feature demoable and testable without secrets, and isolates the only place a future provider swap (or prompt change) would happen.
- **Explicit draft → publish step**, rather than auto-publishing on every save. Marketing pages are user-facing; `revalidatePath` is only called on publish so drafts never leak to the live SSR route.

### Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard, create a page, and start editing.

### AI suggestions

Copy `.env.local.example` to `.env.local` and set `HUGGINGFACE_API_KEY` to use live LLM-generated suggestions:

```bash
cp .env.local.example .env.local
# then edit .env.local and set HUGGINGFACE_API_KEY=hf_...
```

Get a free token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (read access is enough). Optionally set `HUGGINGFACE_MODEL` to use a different hosted model instead of the default `HuggingFaceH4/zephyr-7b-beta`.

Without a key, the app falls back to built-in sample suggestions so the authoring flow still works end-to-end.

### API reference

| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/api/pages` | List all pages |
| `POST` | `/api/pages` | Create a page — body: `{ title, slug }` |
| `GET`  | `/api/pages/:id` | Get one page |
| `PUT`  | `/api/pages/:id` | Update title/blocks — body: `{ title, blocks }` |
| `POST` | `/api/pages/:id/publish` | Mark published + revalidate the public route |
| `POST` | `/api/ai/suggest` | Get copy suggestions — body: `{ blockType, currentText, pageTitle }` |

### Data

Pages are persisted to `data/pages.json` (created on first run) — no external database required for this project.
