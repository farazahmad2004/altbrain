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

export function createStarterNote(): Note {
  return {
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
}

export function createEmptyNote(): Note {
  return {
    id: crypto.randomUUID(),
    title: "Untitled Note",
    content: "# Untitled Note\n\nStart writing...",
    updatedAt: new Date().toISOString(),
  };
}
