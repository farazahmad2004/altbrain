import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { convertWikiLinksToMarkdownLinks } from "@/lib/note-utils";
import type { ViewMode } from "@/types/note";

type MarkdownPreviewProps = {
  content: string;
  viewMode: ViewMode;
  onOpenPageLink: (pageTitle: string) => void;
};

export function MarkdownPreview({
  content,
  viewMode,
  onOpenPageLink,
}: MarkdownPreviewProps) {
  const contentWithWikiLinks = convertWikiLinksToMarkdownLinks(content);

  return (
    <article
      className={`prose prose-invert min-h-[60vh] max-w-none overflow-auto p-6 md:block ${
        viewMode === "preview" ? "block" : "hidden"
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith("#altbrain-wiki-")) {
              const pageTitle = decodeURIComponent(
                href.replace("#altbrain-wiki-", "")
              );

              return (
                <button
                  type="button"
                  onClick={() => onOpenPageLink(pageTitle)}
                  className="font-medium text-neutral-100 underline decoration-neutral-500 underline-offset-4 hover:decoration-neutral-200"
                >
                  {children}
                </button>
              );
            }

            return (
              <a href={href} className="text-neutral-100">
                {children}
              </a>
            );
          },
        }}
      >
        {contentWithWikiLinks}
      </ReactMarkdown>
    </article>
  );
}
