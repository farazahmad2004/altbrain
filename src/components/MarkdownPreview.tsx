import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ViewMode } from "@/types/note";

type MarkdownPreviewProps = {
  content: string;
  viewMode: ViewMode;
};

export function MarkdownPreview({ content, viewMode }: MarkdownPreviewProps) {
  return (
    <article
      className={`prose prose-invert min-h-[60vh] max-w-none overflow-auto p-6 md:block ${
        viewMode === "preview" ? "block" : "hidden"
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
