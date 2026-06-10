import type { Note } from "@/types/note";

export function getDetectedTags(content: string): string[] {
  const tags = new Set<string>();
  const tagPattern = /(^|\s)#([A-Za-z0-9][A-Za-z0-9_-]*)\b/g;
  let match = tagPattern.exec(content);

  while (match) {
    tags.add(match[2]);
    match = tagPattern.exec(content);
  }

  return Array.from(tags);
}

export function getDetectedPageLinks(content: string): string[] {
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

export function getNotePreview(content: string): string {
  return content.replace(/[#*`>-]/g, "").slice(0, 50);
}

export function findNoteByTitle(notes: Note[], title: string): Note | undefined {
  return notes.find((note) => note.title === title);
}

export function createNoteWithTitle(title: string, content?: string): Note {
  return {
    id: crypto.randomUUID(),
    title,
    content: content ?? `# ${title}\n\nStart writing...`,
    updatedAt: new Date().toISOString(),
  };
}

export function createStarterNote(): Note {
  return {
    id: crypto.randomUUID(),
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
}

export function createStarterNotes(): Note[] {
  const now = new Date().toISOString();

  return [
    {
      id: crypto.randomUUID(),
      title: "Welcome to AltBrain",
      content: `# Welcome to AltBrain

AltBrain is a local-first markdown knowledge base for connected thinking.

Try opening [[AI Knowledge Base Roadmap]] or [[Cloud Notes Example]] from the preview.

Use inline tags like #welcome and #knowledge-base to organize notes.
`,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "AI Knowledge Base Roadmap",
      content: `# AI Knowledge Base Roadmap

AltBrain starts local-first before adding sync or AI.

## Near-term ideas

- Fast markdown editing
- [[Daily Notes]] for lightweight journaling
- Backlinks from [[Welcome to AltBrain]]
- Tag-driven review with #ai and #roadmap
`,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Cloud Notes Example",
      content: `# Cloud Notes Example

Use AltBrain to connect cloud architecture notes without leaving markdown.

[[Azure Container Apps]] can belong with [[Machine Learning]] deployment notes.

Useful tags: #cloud #azure #machine-learning
`,
      updatedAt: now,
    },
  ];
}

export function createEmptyNote(): Note {
  return createNoteWithTitle("Untitled Note");
}

export function getBacklinks(notes: Note[], activeNote: Note): Note[] {
  return notes.filter((note) => {
    if (note.id === activeNote.id) return false;

    return getDetectedPageLinks(note.content).includes(activeNote.title);
  });
}

export function getAllTags(notes: Note[]): string[] {
  const tags = new Set<string>();

  notes.forEach((note) => {
    getDetectedTags(note.content).forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort((firstTag, secondTag) =>
    firstTag.localeCompare(secondTag)
  );
}

export function noteHasTag(note: Note, tag: string): boolean {
  return getDetectedTags(note.content).some(
    (noteTag) => noteTag.toLowerCase() === tag.toLowerCase()
  );
}

export function formatUpdatedDate(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return `Updated ${date.toLocaleDateString()}`;
}

export function getTodayTitle(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createDailyNote(title: string): Note {
  return createNoteWithTitle(
    title,
    `# ${title}

## Notes

## Tasks

- [ ] `
  );
}

export function convertWikiLinksToMarkdownLinks(content: string): string {
  return content.replace(/\[\[([^\[\]\n]+)\]\]/g, (wikiLink, pageTitle) => {
    const cleanTitle = String(pageTitle).trim();

    if (!cleanTitle) {
      return wikiLink;
    }

    return `[[${cleanTitle}]](#altbrain-wiki-${encodeURIComponent(
      cleanTitle
    )})`;
  });
}
