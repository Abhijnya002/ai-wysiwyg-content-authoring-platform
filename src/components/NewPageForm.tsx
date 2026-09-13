"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPageForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !slug) return;
    setPending(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug }),
    });
    setPending(false);
    if (res.ok) {
      const page = await res.json();
      router.push(`/editor/${page.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap gap-3 rounded-lg border border-slate-200 p-4">
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
        }}
        placeholder="Page title"
        className="flex-1 rounded-md border border-slate-300 px-3 py-2"
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="url-slug"
        className="w-40 rounded-md border border-slate-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "New Page"}
      </button>
    </form>
  );
}
