"use client"; // a directive to declare a boundary that turns a server-side file into a Client Component

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const starterNote: Note = {
  id: "1",
  title: "Welcome to AltBrain",
  content: `# Welcome to AltBrain

AltBrain is a markdown-first AI knowledge base.

## Try writing markdown

- Create notes
- Link ideas
- Search knowledge
- Add AI later

\`\`\`js
console.log("Hello AltBrain");
\`\`\`
`,
  updatedAt: new Date().toISOString(),
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([starterNote]);
  const [activeNoteId, setActiveNoteId] = useState<string>("1");

  const activeNote = notes.find((note) => note.id === activeNoteId);

  useEffect(() => {
    const savedNotes = localStorage.getItem("altbrain-notes");
    const savedActiveNoteId = localStorage.getItem("altbrain-active-note-id");

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes) as Note[];
      setNotes(parsedNotes);

      if (savedActiveNoteId && parsedNotes.some((note) => note.id === savedActiveNoteId)) {
        setActiveNoteId(savedActiveNoteId);
      } else if (parsedNotes.length > 0) {
        setActiveNoteId(parsedNotes[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("altbrain-notes", JSON.stringify(notes));
    localStorage.setItem("altbrain-active-note-id", activeNoteId);
  }, [notes, activeNoteId]);

  function createNote() {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing...",
      updatedAt: new Date().toISOString(),
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
  }

  function updateActiveNote(field: "title" | "content", value: string) {
    if (!activeNote) return;

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNote.id
          ? {
              ...note,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  }

  function deleteActiveNote() {
    if (!activeNote) return;

    const remainingNotes = notes.filter((note) => note.id !== activeNote.id);
    setNotes(remainingNotes);

    if (remainingNotes.length > 0) {
      setActiveNoteId(remainingNotes[0].id);
    }
  }

  return (
    <main className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="w-72 border-r border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AltBrain</h1>
          <p className="text-sm text-neutral-400">
            Markdown-first AI knowledge base
          </p>
        </div>

        <button
          onClick={createNote}
          className="mb-4 w-full rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200"
        >
          + New Note
        </button>

        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                note.id === activeNoteId
                  ? "bg-neutral-700"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <div className="truncate font-medium">{note.title}</div>
              <div className="truncate text-xs text-neutral-400">
                {note.content.replace(/[#*`>-]/g, "").slice(0, 50)}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        {activeNote ? (
          <>
            <header className="flex items-center justify-between border-b border-neutral-800 p-4">
              <input
                value={activeNote.title}
                onChange={(event) => updateActiveNote("title", event.target.value)}
                className="w-full bg-transparent text-2xl font-semibold outline-none"
              />

              <button
                onClick={deleteActiveNote}
                className="ml-4 rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
              >
                Delete
              </button>
            </header>

            <div className="grid flex-1 grid-cols-2">
              <div className="border-r border-neutral-800">
                <textarea
                  value={activeNote.content}
                  onChange={(event) =>
                    updateActiveNote("content", event.target.value)
                  }
                  className="h-full w-full resize-none bg-neutral-950 p-6 font-mono text-sm text-neutral-100 outline-none"
                />
              </div>

              <article className="prose prose-invert max-w-none overflow-auto p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote.content}
                </ReactMarkdown>
              </article>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-neutral-400">
            No note selected. Create a new note to begin.
          </div>
        )}
      </section>
    </main>
  );
}