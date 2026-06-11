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
      className={`prose prose-invert min-h-[60vh] max-w-none overflow-auto p-6 prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-a:text-neutral-100 prose-code:text-neutral-100 prose-pre:bg-neutral-900 md:block ${
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
                  className="cursor-pointer rounded-sm font-medium text-neutral-100 underline decoration-neutral-500 underline-offset-4 transition-colors hover:decoration-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
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
          h1({ children }) {
            return (
              <h1 className="mb-4 mt-0 border-b border-neutral-800 pb-3 text-3xl font-semibold">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mb-3 mt-8 text-xl font-semibold">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mb-2 mt-6 text-lg font-semibold">
                {children}
              </h3>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-4 list-decimal space-y-1 pl-6 text-neutral-300">
                {children}
              </ol>
            );
          },
          ul({ children }) {
            return (
              <ul className="my-4 list-disc space-y-1 pl-6 text-neutral-300">
                {children}
              </ul>
            );
          },
          li({ children }) {
            return <li className="pl-1 leading-7">{children}</li>;
          },
          code({ children, className }) {
            const isCodeBlock = className?.includes("language-");

            if (isCodeBlock) {
              return (
                <code className={`${className} text-sm text-neutral-100`}>
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-sm text-neutral-100 before:content-none after:content-none">
                {children}
              </code>
            );
          },
          pre({ children }) {
            return (
              <pre className="my-5 overflow-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm leading-6">
                {children}
              </pre>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-5 border-l-2 border-neutral-600 pl-4 text-neutral-300">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="my-5 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-left font-semibold text-neutral-100">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-neutral-800 px-3 py-2 text-neutral-300">
                {children}
              </td>
            );
          },
        }}
      >
        {contentWithWikiLinks}
      </ReactMarkdown>
    </article>
  );
}
