type NoteMetadataProps = {
  tags: string[];
  pageLinks: string[];
};

export function NoteMetadata({ tags, pageLinks }: NoteMetadataProps) {
  if (tags.length === 0 && pageLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {pageLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pageLinks.map((pageLink) => (
            <span
              key={pageLink}
              className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
            >
              [[{pageLink}]]
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
