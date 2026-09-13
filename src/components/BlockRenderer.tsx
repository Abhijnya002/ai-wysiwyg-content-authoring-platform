import type { Block } from "@/lib/types";

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return (
        <section className="relative overflow-hidden rounded-xl bg-slate-900 text-white">
          <img
            src={block.props.imageUrl}
            alt=""
            className="h-64 w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 p-10">
            <h1 className="text-3xl font-bold sm:text-4xl">{block.props.heading}</h1>
            <p className="max-w-xl text-slate-200">{block.props.subheading}</p>
          </div>
        </section>
      );
    case "heading": {
      const Tag = (`h${block.props.level}` as unknown) as "h1" | "h2" | "h3";
      return <Tag className="text-2xl font-semibold">{block.props.text}</Tag>;
    }
    case "text":
      return <p className="text-slate-700 leading-relaxed">{block.props.text}</p>;
    case "image":
      return <img src={block.props.url} alt={block.props.alt} className="w-full rounded-lg" />;
    case "button":
      return (
        <a
          href={block.props.href}
          className="inline-block rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {block.props.label}
        </a>
      );
  }
}
