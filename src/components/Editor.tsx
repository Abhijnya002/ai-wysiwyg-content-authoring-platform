"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { randomId } from "@/lib/id";
import type { Block, Page } from "@/lib/types";
import { BlockRenderer } from "@/components/BlockRenderer";
import { AISuggestButton } from "@/components/AISuggestButton";

function newBlock(type: Block["type"]): Block {
  switch (type) {
    case "hero":
      return {
        id: randomId(),
        type: "hero",
        props: { heading: "New hero heading", subheading: "Supporting subheading", imageUrl: "https://placehold.co/1200x500" },
      };
    case "heading":
      return { id: randomId(), type: "heading", props: { text: "New heading", level: 2 } };
    case "text":
      return { id: randomId(), type: "text", props: { text: "New paragraph text." } };
    case "image":
      return { id: randomId(), type: "image", props: { url: "https://placehold.co/800x400", alt: "" } };
    case "button":
      return { id: randomId(), type: "button", props: { label: "Click me", href: "#" } };
  }
}

export function Editor({ initialPage }: { initialPage: Page }) {
  const router = useRouter();
  const [page, setPage] = useState<Page>(initialPage);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function updateBlock(id: string, props: Partial<Block["props"]>) {
    setPage((p) => ({
      ...p,
      blocks: p.blocks.map((b) => (b.id === id ? ({ ...b, props: { ...b.props, ...props } } as Block) : b)),
    }));
  }

  function removeBlock(id: string) {
    setPage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
  }

  function addBlock(type: Block["type"]) {
    setPage((p) => ({ ...p, blocks: [...p.blocks, newBlock(type)] }));
  }

  function reorder(from: number, to: number) {
    setPage((p) => {
      const blocks = [...p.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...p, blocks };
    });
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    const res = await fetch(`/api/pages/${page.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: page.title, blocks: page.blocks }),
    });
    setSaving(false);
    setStatus(res.ok ? "Saved" : "Failed to save");
  }

  async function publish() {
    await save();
    setPublishing(true);
    const res = await fetch(`/api/pages/${page.id}/publish`, { method: "POST" });
    setPublishing(false);
    if (res.ok) {
      const updated = await res.json();
      setPage(updated);
      setStatus("Published");
    } else {
      setStatus("Failed to publish");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-10">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <input
            value={page.title}
            onChange={(e) => setPage((p) => ({ ...p, title: e.target.value }))}
            className="w-full max-w-md rounded-md border border-transparent px-1 text-xl font-bold hover:border-slate-300 focus:border-slate-300 focus:outline-none"
          />
          <div className="flex items-center gap-3">
            {status && <span className="text-sm text-slate-500">{status}</span>}
            <button
              onClick={() => router.push("/")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              Back
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-dashed border-slate-300 p-6">
          {page.blocks.length === 0 && (
            <p className="text-center text-sm text-slate-400">No blocks yet — add one from the panel.</p>
          )}
          {page.blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) reorder(dragIndex, index);
                setDragIndex(null);
              }}
              className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span className="cursor-move select-none">⠿ {block.type}</span>
                <div className="flex items-center gap-2">
                  {block.type !== "image" && (
                    <AISuggestButton
                      blockType={block.type}
                      pageTitle={page.title}
                      currentText={
                        block.type === "hero"
                          ? block.props.heading
                          : block.type === "button"
                            ? block.props.label
                            : block.props.text
                      }
                      onApply={(text) => {
                        if (block.type === "text" || block.type === "heading") updateBlock(block.id, { text });
                        if (block.type === "hero") updateBlock(block.id, { heading: text });
                        if (block.type === "button") updateBlock(block.id, { label: text });
                      }}
                    />
                  )}
                  <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
              <BlockEditor block={block} onChange={(props) => updateBlock(block.id, props)} />
            </div>
          ))}
        </div>
      </div>

      <aside className="w-56 shrink-0 space-y-3">
        <h2 className="text-sm font-semibold text-slate-600">Add block</h2>
        {(["hero", "heading", "text", "image", "button"] as const).map((type) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-left text-sm capitalize hover:bg-slate-50"
          >
            + {type}
          </button>
        ))}

        <h2 className="pt-4 text-sm font-semibold text-slate-600">Preview</h2>
        <div className="scale-[0.9] origin-top-left space-y-3 rounded-md border border-slate-200 p-3">
          {page.blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </div>
      </aside>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (props: Partial<Block["props"]>) => void }) {
  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 font-semibold"
            value={block.props.heading}
            onChange={(e) => onChange({ heading: e.target.value })}
          />
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1"
            value={block.props.subheading}
            onChange={(e) => onChange({ subheading: e.target.value })}
          />
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={block.props.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="Image URL"
          />
        </div>
      );
    case "heading":
      return (
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-2 py-1"
            value={block.props.text}
            onChange={(e) => onChange({ text: e.target.value })}
          />
          <select
            value={block.props.level}
            onChange={(e) => onChange({ level: Number(e.target.value) as 1 | 2 | 3 })}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
      );
    case "text":
      return (
        <textarea
          className="w-full rounded-md border border-slate-300 px-2 py-1"
          rows={3}
          value={block.props.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      );
    case "image":
      return (
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={block.props.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Image URL"
          />
          <input
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={block.props.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Alt text"
          />
        </div>
      );
    case "button":
      return (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-2 py-1"
            value={block.props.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
          <input
            className="flex-1 rounded-md border border-slate-300 px-2 py-1"
            value={block.props.href}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="Link URL"
          />
        </div>
      );
  }
}
