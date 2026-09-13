import { NextRequest, NextResponse } from "next/server";
import { createPage, listPages } from "@/lib/store";

export async function GET() {
  return NextResponse.json(listPages());
}

export async function POST(req: NextRequest) {
  const { title, slug } = await req.json();
  if (!title || !slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
  }
  const page = createPage(title, slug);
  return NextResponse.json(page, { status: 201 });
}
