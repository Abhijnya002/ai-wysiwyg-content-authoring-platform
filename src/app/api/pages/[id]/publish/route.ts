import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPage, setPageStatus } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getPage(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const page = setPageStatus(id, "published");
  if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });

  revalidatePath(`/${page.slug}`);
  return NextResponse.json(page);
}
