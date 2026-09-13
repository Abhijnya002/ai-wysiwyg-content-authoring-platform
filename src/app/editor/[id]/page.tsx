import { notFound } from "next/navigation";
import { getPage } from "@/lib/store";
import { Editor } from "@/components/Editor";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getPage(id);
  if (!page) notFound();

  return <Editor initialPage={page} />;
}
