## AI-Assisted WYSIWYG Content Authoring Platform

A WYSIWYG page builder for marketing pages, built with React, Next.js, and TypeScript.

### Features

- **WYSIWYG page builder** — add, edit, reorder (drag & drop), and remove content blocks (hero, heading, text, image, button) with a live preview.
- **Server-side rendering** — published marketing pages (`/[slug]`) are rendered on the server for fast, SEO-friendly delivery.
- **AI-assisted authoring** — click "AI Suggest" on any text block to get LLM-generated copy alternatives, streamlining content creation.
- **Publishing workflow** — save drafts, then publish; publishing revalidates the live SSR page instantly.

### Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard, create a page, and start editing.

### AI suggestions

Copy `.env.local.example` to `.env.local` and set `ANTHROPIC_API_KEY` to use live LLM-generated suggestions. Without a key, the app falls back to built-in sample suggestions so the authoring flow still works end-to-end.

### Data

Pages are persisted to `data/pages.json` (created on first run) — no external database required for this demo.
