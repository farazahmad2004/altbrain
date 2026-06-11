import { getNotePreview } from "@/lib/note-utils";
import type { Note } from "@/types/note";

type BacklinksProps = {
  backlinks: Note[];
  onSelectNote: (noteId: string) => void;
};

export function Backlinks({ backlinks, onSelectNote }: BacklinksProps) {
  if (backlinks.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-800 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Linked references
      </h2>

      <div className="space-y-2">
        {backlinks.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="w-full cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          >
            <div className="truncate text-sm font-medium text-neutral-100">
              {note.title}
            </div>
            <div className="mt-1 truncate text-xs text-neutral-400">
              {getNotePreview(note.content)}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
