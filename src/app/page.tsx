import Link from "next/link";
import { listPages } from "@/lib/store";
import { NewPageForm } from "@/components/NewPageForm";

export default function Dashboard() {
  const pages = listPages();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">Pages</h1>
      <p className="mt-1 text-slate-600">Build, preview, and publish marketing pages.</p>

      <NewPageForm />

      <ul className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200">
        {pages.map((page) => (
          <li key={page.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-sm text-slate-500">
                /{page.slug} ·{" "}
                <span className={page.status === "published" ? "text-green-600" : "text-amber-600"}>
                  {page.status}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              {page.status === "published" && (
                <Link href={`/${page.slug}`} className="text-sm text-indigo-600 hover:underline">
                  View
                </Link>
              )}
              <Link href={`/editor/${page.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
