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

// Free-tier Hugging Face Inference API model. Override with HUGGINGFACE_MODEL if desired.
const DEFAULT_MODEL = "HuggingFaceH4/zephyr-7b-beta";

function parseSuggestions(generated: string): string[] {
  const lines = generated
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 3);
}

export async function generateSuggestions(params: SuggestParams): Promise<string[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return mockSuggestions(params);
  }

  const model = process.env.HUGGINGFACE_MODEL ?? DEFAULT_MODEL;
  const prompt = `You are helping author a marketing page titled "${params.pageTitle}".
Suggest 3 alternative versions of the "${params.blockType}" copy below. Keep the tone concise and persuasive, matching the original length roughly.
Reply with exactly 3 lines, one suggestion per line, and nothing else.

Current copy: "${params.currentText}"`;

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 200, temperature: 0.7, return_full_text: false },
      }),
    });

    if (!res.ok) return mockSuggestions(params);

    const data = await res.json();
    const generatedText = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    if (typeof generatedText !== "string") return mockSuggestions(params);

    const suggestions = parseSuggestions(generatedText);
    return suggestions.length > 0 ? suggestions : mockSuggestions(params);
  } catch {
    return mockSuggestions(params);
  }
}
