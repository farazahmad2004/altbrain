import type { Note } from "@/types/note";

export type SourceNote = {
  id: string;
  title: string;
  content: string;
};

const COMMON_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "what",
  "with",
]);

function getQuestionWords(question: string): string[] {
  return question
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .filter((word) => word.length > 2 && !COMMON_WORDS.has(word));
}

function truncateContent(content: string) {
  return content.length > 2000 ? `${content.slice(0, 2000)}...` : content;
}

function toSourceNote(note: Note): SourceNote {
  return {
    id: note.id,
    title: note.title,
    content: truncateContent(note.content),
  };
}

export function selectRelevantNotes(
  question: string,
  notes: Note[],
  limit = 5
): SourceNote[] {
  const words = getQuestionWords(question);
  const recentNotes = [...notes].sort(
    (firstNote, secondNote) =>
      new Date(secondNote.updatedAt).getTime() -
      new Date(firstNote.updatedAt).getTime()
  );

  if (words.length === 0) {
    return recentNotes.slice(0, limit).map(toSourceNote);
  }

  const scoredNotes = recentNotes.map((note) => {
    const title = note.title.toLowerCase();
    const content = note.content.toLowerCase();
    let score = 0;

    words.forEach((word) => {
      if (title.includes(word)) {
        score += 4;
      }

      if (content.includes(word)) {
        score += 1;
      }
    });

    return {
      note,
      score,
    };
  });

  const matchingNotes = scoredNotes
    .filter((item) => item.score > 0)
    .sort((firstItem, secondItem) => secondItem.score - firstItem.score);

  if (matchingNotes.length === 0) {
    return recentNotes.slice(0, limit).map(toSourceNote);
  }

  return matchingNotes
    .slice(0, limit)
    .map((item) => toSourceNote(item.note));
}
