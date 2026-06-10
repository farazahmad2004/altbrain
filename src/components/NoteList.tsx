import { formatUpdatedDate, getNotePreview } from "@/lib/note-utils";
import type { Note } from "@/types/note";

type NoteListProps = {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (noteId: string) => void;
};

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
}: NoteListProps) {
  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`w-full rounded-lg border px-3 py-2.5 text-left ${
            note.id === activeNoteId
              ? "border-neutral-500 bg-neutral-800"
              : "border-neutral-800 bg-neutral-950 hover:bg-neutral-800"
          }`}
        >
          <div className="truncate text-sm font-medium text-neutral-100">
            {note.title}
          </div>
          <div className="mt-1 truncate text-xs text-neutral-400">
            {getNotePreview(note.content)}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {formatUpdatedDate(note.updatedAt)}
          </div>
        </button>
      ))}
    </div>
  );
}
