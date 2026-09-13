import { NextRequest, NextResponse } from "next/server";
import { getPage, updatePage } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = getPage(id);
  if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const page = updatePage(id, { title: body.title, blocks: body.blocks });
  if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(page);
}
