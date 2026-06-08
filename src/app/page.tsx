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

type ViewMode = "editor" | "preview";

function getDetectedTags(content: string) {
  const tags = new Set<string>();
  const tagPattern = /(^|\s)#([A-Za-z0-9][A-Za-z0-9_-]*)\b/g;
  let match = tagPattern.exec(content);

  while (match) {
    tags.add(match[2]);
    match = tagPattern.exec(content);
  }

  return Array.from(tags);
}

function getDetectedPageLinks(content: string) {
  const pageLinks = new Set<string>();
  const pageLinkPattern = /\[\[([^\[\]\n]+)\]\]/g;
  let match = pageLinkPattern.exec(content);

  while (match) {
    const pageTitle = match[1].trim();

    if (pageTitle) {
      pageLinks.add(pageTitle);
    }

    match = pageLinkPattern.exec(content);
  }

  return Array.from(pageLinks);
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([starterNote]);
  const [activeNoteId, setActiveNoteId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

  const activeNote = notes.find((note) => note.id === activeNoteId);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    if (!normalizedSearchQuery) return true;

    return (
      note.title.toLowerCase().includes(normalizedSearchQuery) ||
      note.content.toLowerCase().includes(normalizedSearchQuery)
    );
  });
  const activeTags = activeNote ? getDetectedTags(activeNote.content) : [];
  const activePageLinks = activeNote
    ? getDetectedPageLinks(activeNote.content)
    : [];

  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
    } else {
      setActiveNoteId("");
    }
}

  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      <aside className="w-full border-b border-neutral-800 bg-neutral-900 p-4 md:w-72 md:border-b-0 md:border-r">
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

        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search notes..."
          className="mb-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
        />

        <div className="space-y-2">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
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
            ))
          ) : (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-4 text-sm text-neutral-400">
              {notes.length === 0
                ? "No notes yet."
                : "No matching notes found."}
            </div>
          )}
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        {activeNote ? (
          <>
            <header className="border-b border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <input
                    value={activeNote.title}
                    onChange={(event) =>
                      updateActiveNote("title", event.target.value)
                    }
                    className="w-full bg-transparent text-2xl font-semibold outline-none"
                  />

                  {(activeTags.length > 0 || activePageLinks.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {activeTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {activePageLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activePageLinks.map((pageLink) => (
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
                  )}
                </div>

                <button
                  onClick={deleteActiveNote}
                  className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 rounded-lg border border-neutral-800 p-1 md:hidden">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`rounded-md px-3 py-2 text-sm ${
                    viewMode === "editor"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  Editor
                </button>

                <button
                  onClick={() => setViewMode("preview")}
                  className={`rounded-md px-3 py-2 text-sm ${
                    viewMode === "preview"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400"
                  }`}
                >
                  Preview
                </button>
              </div>
            </header>

            <div className="grid flex-1 md:grid-cols-2">
              <div
                className={`min-h-[60vh] border-neutral-800 md:block md:border-r ${
                  viewMode === "editor" ? "block" : "hidden"
                }`}
              >
                <textarea
                  value={activeNote.content}
                  onChange={(event) =>
                    updateActiveNote("content", event.target.value)
                  }
                  className="h-full w-full resize-none bg-neutral-950 p-6 font-mono text-sm text-neutral-100 outline-none"
                />
              </div>

              <article
                className={`prose prose-invert min-h-[60vh] max-w-none overflow-auto p-6 md:block ${
                  viewMode === "preview" ? "block" : "hidden"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote.content}
                </ReactMarkdown>
              </article>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div>
              <p className="mb-4 text-neutral-400">
                No notes yet. Create your first note to begin.
              </p>

              <button
                onClick={createNote}
                className="rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 hover:bg-neutral-200"
              >
                Create your first note
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
