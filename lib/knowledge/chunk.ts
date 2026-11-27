import { loadDocuments, type KnowledgeDoc } from "@/lib/knowledge/load";

export type KnowledgeChunk = {
  id: string;
  source: string;
  title: string;
  text: string;
};

const MAX_CHARS = 1600;

function sectionsOf(doc: KnowledgeDoc): { title: string; text: string }[] {
  const parts = doc.text.replace(/\r\n/g, "\n").split(/^## +/m);
  const sections: { title: string; text: string }[] = [];
  const fallback = doc.source.replace(/\.md$/, "");
  const preamble = parts[0]?.trim();
  if (preamble) {
    sections.push({ title: fallback, text: preamble });
  }
  for (const part of parts.slice(1)) {
    const breakAt = part.indexOf("\n");
    const title = (breakAt === -1 ? part : part.slice(0, breakAt)).trim();
    const body = (breakAt === -1 ? "" : part.slice(breakAt + 1)).trim();
    if (!body) continue;
    sections.push({ title, text: body });
  }
  return sections;
}

function splitLong(title: string, text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  const paragraphs = text.split(/\n\n+/);
  const pieces: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > MAX_CHARS && current) {
      pieces.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }
  if (current.trim()) pieces.push(current.trim());
  return pieces;
}

export function chunkDocument(doc: KnowledgeDoc): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  for (const section of sectionsOf(doc)) {
    const pieces = splitLong(section.title, section.text);
    pieces.forEach((text, index) => {
      const suffix = pieces.length > 1 ? `-${index + 1}` : "";
      chunks.push({
        id: `${doc.source}:${slug(section.title)}${suffix}`,
        source: doc.source,
        title: section.title,
        text,
      });
    });
  }
  return chunks;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function loadChunks(): KnowledgeChunk[] {
  return loadDocuments().flatMap(chunkDocument);
}
