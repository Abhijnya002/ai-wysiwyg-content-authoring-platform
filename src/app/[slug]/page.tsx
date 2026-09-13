import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/store";
import { BlockRenderer } from "@/components/BlockRenderer";

export default async function MarketingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page || page.status !== "published") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      {page.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
