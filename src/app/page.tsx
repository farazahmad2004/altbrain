"use client"; // a directive to declare a boundary that turns a server-side file into a Client Component

import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthScreen } from "@/components/AuthScreen";
import { AiChatPanel } from "@/components/AiChatPanel";
import { Backlinks } from "@/components/Backlinks";
import { EmptyState } from "@/components/EmptyState";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteMetadata } from "@/components/NoteMetadata";
import { Sidebar } from "@/components/Sidebar";
import {
  createDailyNote,
  createEmptyNote,
  createNoteWithTitle,
  createStarterNotes,
  findNoteByTitle,
  getAllTags,
  getBacklinks,
  getDetectedPageLinks,
  getDetectedTags,
  getTodayTitle,
  noteHasTag,
} from "@/lib/note-utils";
import {
  createNoteInDb,
  deleteNoteFromDb,
  fetchNotes,
  updateNoteInDb,
} from "@/lib/notes-api";
import { clearAiSession } from "@/lib/ai-session";
import { getCurrentUser, signOut } from "@/lib/auth-api";
import { supabase } from "@/lib/supabase";
import type { Note, ViewMode } from "@/types/note";
import type { User } from "@supabase/supabase-js";

const ACTIVE_NOTE_STORAGE_KEY = "altbrain-active-note-id";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing notes.";
}

function getActiveIdFromNotes(notes: Note[], preferredNoteId: string | null) {
  if (preferredNoteId && notes.some((note) => note.id === preferredNoteId)) {
    return preferredNoteId;
  }

  return notes[0]?.id ?? "";
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem(ACTIVE_NOTE_STORAGE_KEY) ?? "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSyncingNotes, setIsSyncingNotes] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasLoadedNotes, setHasLoadedNotes] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingNoteSave, setPendingNoteSave] = useState<Note | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const userRef = useRef<User | null>(null);
  const notesRef = useRef<Note[]>([]);

  const activeNote = notes.find((note) => note.id === activeNoteId);
  const sortedNotes = [...notes].sort(
    (firstNote, secondNote) =>
      new Date(secondNote.updatedAt).getTime() -
      new Date(firstNote.updatedAt).getTime()
  );
  const allTags = getAllTags(notes);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredNotes = sortedNotes.filter((note) => {
    const matchesSearch =
      !normalizedSearchQuery ||
      note.title.toLowerCase().includes(normalizedSearchQuery) ||
      note.content.toLowerCase().includes(normalizedSearchQuery);
    const matchesTag = !activeTag || noteHasTag(note, activeTag);

    return matchesSearch && matchesTag;
  });
  const activeBacklinks = activeNote ? getBacklinks(notes, activeNote) : [];
  const activeTags = activeNote ? getDetectedTags(activeNote.content) : [];
  const activePageLinks = activeNote
    ? getDetectedPageLinks(activeNote.content)
    : [];

  const selectActiveNote = useCallback((noteId: string) => {
    setActiveNoteId(noteId);

    if (noteId) {
      sessionStorage.setItem(ACTIVE_NOTE_STORAGE_KEY, noteId);
    } else {
      sessionStorage.removeItem(ACTIVE_NOTE_STORAGE_KEY);
    }
  }, []);

  const openOrCreatePageLink = useCallback((pageTitle: string) => {
    if (!user) return;

    const existingNote = findNoteByTitle(notes, pageTitle);

    if (existingNote) {
      selectActiveNote(existingNote.id);
      return;
    }

    const newNote = createNoteWithTitle(pageTitle);

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    selectActiveNote(newNote.id);
    createNoteInDb(newNote, user.id).catch((error: unknown) => {
      setSyncError(getErrorMessage(error));
    });
  }, [notes, selectActiveNote, user]);

  const openDailyNote = useCallback(() => {
    if (!user) return;

    const todayTitle = getTodayTitle();
    const existingNote = findNoteByTitle(notes, todayTitle);

    if (existingNote) {
      selectActiveNote(existingNote.id);
      return;
    }

    const newNote = createDailyNote(todayTitle);

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    selectActiveNote(newNote.id);
    createNoteInDb(newNote, user.id).catch((error: unknown) => {
      setSyncError(getErrorMessage(error));
    });
  }, [notes, selectActiveNote, user]);

  const createNote = useCallback(() => {
    if (!user) return;

    const newNote = createEmptyNote();

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    selectActiveNote(newNote.id);
    createNoteInDb(newNote, user.id).catch((error: unknown) => {
      setSyncError(getErrorMessage(error));
    });
  }, [selectActiveNote, user]);

  function updateActiveNote(field: "title" | "content", value: string) {
    if (!activeNote) return;

    const updatedNote = {
      ...activeNote,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNote.id ? updatedNote : note
      )
    );
    setPendingNoteSave(updatedNote);
  }

  function deleteActiveNote() {
    if (!activeNote) return;

    const remainingNotes = notes.filter((note) => note.id !== activeNote.id);
    setNotes(remainingNotes);

    if (remainingNotes.length > 0) {
      selectActiveNote(remainingNotes[0].id);
    } else {
      selectActiveNote("");
    }

    deleteNoteFromDb(activeNote.id).catch((error: unknown) => {
      setSyncError(getErrorMessage(error));
    });
  }

  async function handleLogout() {
    try {
      await signOut();
      setUser(null);
      setNotes([]);
      selectActiveNote("");
      setPendingNoteSave(null);
      setHasLoadedNotes(false);
      setSyncError(null);
      clearAiSession();
    } catch (error) {
      setSyncError(getErrorMessage(error));
    }
  }

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;

        setUser(currentUser);

        if (!currentUser) {
          setIsLoadingNotes(false);
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) return;

        setSyncError(getErrorMessage(error));
      })
      .finally(() => {
        if (!isMounted) return;

        setIsCheckingAuth(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      const currentUser = userRef.current;
      const currentUserId = currentUser?.id ?? null;
      const nextUserId = nextUser?.id ?? null;

      if (currentUserId === nextUserId) {
        setUser(nextUser);
        return;
      }

      setUser(nextUser);
      setPendingNoteSave(null);
      setSyncError(null);

      if (!nextUser) {
        setNotes([]);
        selectActiveNote("");
        setHasLoadedNotes(false);
        setIsLoadingNotes(false);
        clearAiSession();
        return;
      }

      setNotes([]);
      selectActiveNote("");
      setHasLoadedNotes(false);
      setIsLoadingNotes(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [selectActiveNote]);

  useEffect(() => {
    if (isCheckingAuth || !user) return;

    let isMounted = true;
    const userId = user.id;

    async function loadUserNotes() {
      const hasExistingNotes = notesRef.current.length > 0;

      setIsLoadingNotes(!hasExistingNotes);
      setIsSyncingNotes(hasExistingNotes);
      setHasLoadedNotes(false);

      try {
        const databaseNotes = await fetchNotes(userId);
        const nextNotes =
          databaseNotes.length > 0
            ? databaseNotes
            : await Promise.all(
                createStarterNotes().map((note) =>
                  createNoteInDb(note, userId)
                )
              );

        if (!isMounted) return;

        setNotes(nextNotes);
        const savedActiveNoteId =
          sessionStorage.getItem(ACTIVE_NOTE_STORAGE_KEY) ?? null;
        selectActiveNote(getActiveIdFromNotes(nextNotes, savedActiveNoteId));
        setSyncError(null);
      } catch (error) {
        if (!isMounted) return;

        setNotes([]);
        selectActiveNote("");
        setSyncError(getErrorMessage(error));
      } finally {
        if (!isMounted) return;

        setIsLoadingNotes(false);
        setIsSyncingNotes(false);
        setHasLoadedNotes(true);
      }
    }

    loadUserNotes();

    return () => {
      isMounted = false;
    };
  }, [user, isCheckingAuth, selectActiveNote]);

  useEffect(() => {
    if (!pendingNoteSave || !hasLoadedNotes || !user) return;

    const timeoutId = window.setTimeout(() => {
      updateNoteInDb(pendingNoteSave)
        .then(() => {
          setSyncError(null);
        })
        .catch((error: unknown) => {
          setSyncError(getErrorMessage(error));
        });
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingNoteSave, hasLoadedNotes, user]);

  useEffect(() => {
    if (!user) return;

    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = event.altKey && !event.ctrlKey && !event.metaKey;
      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";

      if (!isShortcut) return;

      if (key === "n") {
        event.preventDefault();
        createNote();
      }

      if (key === "d") {
        event.preventDefault();
        openDailyNote();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [createNote, openDailyNote, user]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-400">
        Checking account...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onAuthSuccess={() => {
          setIsCheckingAuth(true);
          getCurrentUser()
            .then((currentUser) => {
              setUser(currentUser);
            })
            .catch((error: unknown) => {
              setSyncError(getErrorMessage(error));
            })
            .finally(() => {
              setIsCheckingAuth(false);
            });
        }}
      />
    );
  }

  return (
    <AppShell>
      <Sidebar
        notes={notes}
        filteredNotes={filteredNotes}
        activeNoteId={activeNoteId}
        searchQuery={searchQuery}
        tags={allTags}
        activeTag={activeTag}
        userEmail={user.email}
        onSearchChange={setSearchQuery}
        onCreateNote={createNote}
        onOpenDailyNote={openDailyNote}
        onSelectNote={selectActiveNote}
        onSelectTag={setActiveTag}
        onClearTag={() => setActiveTag(null)}
        onLogout={handleLogout}
      />

      <section className="flex flex-1 flex-col">
        {syncError && (
          <div className="border-b border-yellow-900/60 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-200">
            {syncError}
          </div>
        )}

        {isSyncingNotes && (
          <div className="border-b border-neutral-800 px-4 py-2 text-xs text-neutral-500">
            Syncing notes...
          </div>
        )}

        {isLoadingNotes && notes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6 text-neutral-400">
            Loading notes...
          </div>
        ) : activeNote ? (
          <>
            <header className="border-b border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <input
                    value={activeNote.title}
                    spellCheck={false}
                    onChange={(event) =>
                      updateActiveNote("title", event.target.value)
                    }
                    className="w-full rounded-lg bg-transparent text-2xl font-semibold outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
                  />

                  <NoteMetadata
                    tags={activeTags}
                    pageLinks={activePageLinks}
                    onOpenPageLink={openOrCreatePageLink}
                  />
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => setIsAiOpen(true)}
                    aria-label="Open Ask AltBrain AI"
                    className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
                  >
                    Ask AltBrain AI
                  </button>

                  <button
                    onClick={deleteActiveNote}
                    aria-label="Delete active note"
                    className="cursor-pointer rounded-full border border-red-900/70 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-950/70 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 rounded-lg border border-neutral-800 p-1 md:hidden">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                    viewMode === "editor"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                  }`}
                >
                  Editor
                </button>

                <button
                  onClick={() => setViewMode("preview")}
                  className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 ${
                    viewMode === "preview"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                  }`}
                >
                  Preview
                </button>
              </div>
            </header>

            <div className="grid flex-1 md:grid-cols-2">
              <NoteEditor
                note={activeNote}
                viewMode={viewMode}
                onContentChange={(content) =>
                  updateActiveNote("content", content)
                }
              />

              <MarkdownPreview
                content={activeNote.content}
                viewMode={viewMode}
                onOpenPageLink={openOrCreatePageLink}
              />
            </div>

            <Backlinks
              backlinks={activeBacklinks}
              onSelectNote={selectActiveNote}
            />
          </>
        ) : (
          <>
            <header className="flex items-center justify-end border-b border-neutral-800 p-4">
              <button
                onClick={() => setIsAiOpen(true)}
                aria-label="Open Ask AltBrain AI"
                className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
              >
                Ask AltBrain AI
              </button>
            </header>

            <EmptyState onCreateNote={createNote} />
          </>
        )}
      </section>

      <AiChatPanel
        notes={notes}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </AppShell>
  );
}
