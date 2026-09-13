import { NextRequest, NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { blockType, currentText, pageTitle } = await req.json();
  if (!blockType) {
    return NextResponse.json({ error: "blockType is required" }, { status: 400 });
  }
  const suggestions = await generateSuggestions({
    blockType,
    currentText: currentText ?? "",
    pageTitle: pageTitle ?? "",
  });
  return NextResponse.json({ suggestions });
}
