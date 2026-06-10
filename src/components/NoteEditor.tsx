import type { Note, ViewMode } from "@/types/note";

type NoteEditorProps = {
  note: Note;
  viewMode: ViewMode;
  onContentChange: (content: string) => void;
};

export function NoteEditor({
  note,
  viewMode,
  onContentChange,
}: NoteEditorProps) {
  return (
    <div
      className={`min-h-[60vh] border-neutral-800 md:block md:border-r ${
        viewMode === "editor" ? "block" : "hidden"
      }`}
    >
      <textarea
        value={note.content}
        spellCheck={false}
        placeholder="Start writing in markdown..."
        onChange={(event) => onContentChange(event.target.value)}
        className="h-full w-full resize-none bg-neutral-950 p-6 font-mono text-sm leading-6 tracking-normal text-neutral-100 outline-none placeholder:text-neutral-600"
        style={{ fontVariantLigatures: "none" }}
      />
    </div>
  );
}
