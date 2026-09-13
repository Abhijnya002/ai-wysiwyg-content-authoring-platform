import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Page } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "pages.json");

function seedPages(): Page[] {
  return [
    {
      id: randomUUID(),
      slug: "welcome",
      title: "Welcome to Acme",
      status: "published",
      blocks: [
        {
          id: randomUUID(),
          type: "hero",
          props: {
            heading: "Build marketing pages without waiting on engineering",
            subheading: "A WYSIWYG page builder with AI-assisted copywriting.",
            imageUrl: "https://placehold.co/1200x500?text=Hero+Image",
          },
        },
        {
          id: randomUUID(),
          type: "text",
          props: {
            text: "Drag blocks into place, edit copy inline, and publish instantly with server-side rendering.",
          },
        },
        { id: randomUUID(), type: "button", props: { label: "Get Started", href: "#" } },
      ],
      updatedAt: new Date().toISOString(),
    },
  ];
}

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedPages(), null, 2));
  }
}

function readAll(): Page[] {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Page[];
}

function writeAll(pages: Page[]): void {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2));
}

export function listPages(): Page[] {
  return readAll();
}

export function getPage(id: string): Page | undefined {
  return readAll().find((p) => p.id === id);
}

export function getPageBySlug(slug: string): Page | undefined {
  return readAll().find((p) => p.slug === slug);
}

export function createPage(title: string, slug: string): Page {
  const pages = readAll();
  const page: Page = {
    id: randomUUID(),
    slug,
    title,
    status: "draft",
    blocks: [],
    updatedAt: new Date().toISOString(),
  };
  pages.push(page);
  writeAll(pages);
  return page;
}

export function updatePage(id: string, updates: Partial<Pick<Page, "title" | "blocks">>): Page | undefined {
  const pages = readAll();
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  pages[idx] = { ...pages[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(pages);
  return pages[idx];
}

export function setPageStatus(id: string, status: Page["status"]): Page | undefined {
  const pages = readAll();
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  pages[idx] = { ...pages[idx], status, updatedAt: new Date().toISOString() };
  writeAll(pages);
  return pages[idx];
}
