import { NoteList } from "@/components/NoteList";
import type { Note } from "@/types/note";

type SidebarProps = {
  notes: Note[];
  filteredNotes: Note[];
  activeNoteId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  onSelectNote: (noteId: string) => void;
};

export function Sidebar({
  notes,
  filteredNotes,
  activeNoteId,
  searchQuery,
  onSearchChange,
  onCreateNote,
  onSelectNote,
}: SidebarProps) {
  return (
    <aside className="w-full border-b border-neutral-800 bg-neutral-900 p-4 md:w-72 md:border-b-0 md:border-r">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AltBrain</h1>
        <p className="text-sm text-neutral-400">
          Markdown-first AI knowledge base
        </p>
      </div>

      <button
        onClick={onCreateNote}
        className="mb-4 w-full rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200"
      >
        + New Note
      </button>

      <input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search notes..."
        className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
      />

      {filteredNotes.length > 0 ? (
        <NoteList
          notes={filteredNotes}
          activeNoteId={activeNoteId}
          onSelectNote={onSelectNote}
        />
      ) : (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-4 text-sm text-neutral-400">
          {notes.length === 0 ? "No notes yet." : "No matching notes found."}
        </div>
      )}
    </aside>
  );
}
