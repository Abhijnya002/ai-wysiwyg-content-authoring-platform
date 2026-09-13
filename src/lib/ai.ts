import Anthropic from "@anthropic-ai/sdk";

export interface SuggestParams {
  blockType: string;
  currentText: string;
  pageTitle: string;
}

const MOCK_SUGGESTIONS: Record<string, string[]> = {
  heading: [
    "Launch faster with a page builder made for marketers",
    "Ship on-brand pages without writing a line of code",
    "Turn content ideas into published pages in minutes",
  ],
  text: [
    "Assemble sections visually, tweak copy inline, and publish with confidence — every page is server-rendered for speed and SEO.",
    "From first draft to live page in one workflow: edit blocks, preview instantly, and publish when you're ready.",
    "Give your team a self-serve way to build marketing pages, backed by fast server-side rendering.",
  ],
  button: ["Get Started", "See It In Action", "Start Free"],
  hero: [
    "Everything you need to publish a great page, today",
    "Marketing pages, built visually, shipped instantly",
  ],
};

function mockSuggestions(params: SuggestParams): string[] {
  return MOCK_SUGGESTIONS[params.blockType] ?? MOCK_SUGGESTIONS.text;
}

export async function generateSuggestions(params: SuggestParams): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return mockSuggestions(params);
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are helping author a marketing page titled "${params.pageTitle}".
Suggest 3 alternative versions of the "${params.blockType}" copy below. Keep the tone concise and persuasive, matching the original length roughly.
Return only a JSON array of 3 strings, nothing else.

Current copy: "${params.currentText}"`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return mockSuggestions(params);

    const parsed = JSON.parse(textBlock.text.trim());
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
      return parsed;
    }
    return mockSuggestions(params);
  } catch {
    return mockSuggestions(params);
  }
}
