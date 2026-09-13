export type BlockType = "hero" | "heading" | "text" | "image" | "button";

export type Block =
  | { id: string; type: "hero"; props: { heading: string; subheading: string; imageUrl: string } }
  | { id: string; type: "heading"; props: { text: string; level: 1 | 2 | 3 } }
  | { id: string; type: "text"; props: { text: string } }
  | { id: string; type: "image"; props: { url: string; alt: string } }
  | { id: string; type: "button"; props: { label: string; href: string } };

export type PageStatus = "draft" | "published";

export interface Page {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  blocks: Block[];
  updatedAt: string;
}
