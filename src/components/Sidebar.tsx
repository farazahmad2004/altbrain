import { NoteList } from "@/components/NoteList";
import type { Note } from "@/types/note";

type SidebarProps = {
  notes: Note[];
  filteredNotes: Note[];
  activeNoteId: string;
  searchQuery: string;
  tags: string[];
  activeTag: string | null;
  userEmail?: string;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  onOpenDailyNote: () => void;
  onSelectNote: (noteId: string) => void;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
  onLogout: () => void;
};

export function Sidebar({
  notes,
  filteredNotes,
  activeNoteId,
  searchQuery,
  tags,
  activeTag,
  userEmail,
  onSearchChange,
  onCreateNote,
  onOpenDailyNote,
  onSelectNote,
  onSelectTag,
  onClearTag,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-full border-b border-neutral-800 bg-neutral-900 p-4 md:w-72 md:border-b-0 md:border-r">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AltBrain</h1>
        <p className="text-sm text-neutral-400">
          Markdown-first AI knowledge base
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2">
        {userEmail && (
          <div className="mb-2 truncate text-xs text-neutral-400">
            {userEmail}
          </div>
        )}

        <button
          onClick={onLogout}
          className="text-sm text-neutral-300 hover:text-white"
        >
          Logout
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={onCreateNote}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          + New Note
        </button>

        <button
          onClick={onOpenDailyNote}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-800"
        >
          Daily Note
        </button>
      </div>

      <input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search notes..."
        className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
      />

      {tags.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Tags
            </h2>

            {activeTag && (
              <button
                onClick={onClearTag}
                className="text-xs text-neutral-400 hover:text-neutral-100"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  activeTag === tag
                    ? "border-neutral-300 bg-neutral-100 text-neutral-950"
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

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
