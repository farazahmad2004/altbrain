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
          className={`w-full rounded-lg px-3 py-2 text-left ${
            note.id === activeNoteId
              ? "bg-neutral-700"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          <div className="truncate font-medium">{note.title}</div>
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
