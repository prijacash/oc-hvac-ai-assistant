import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type KnowledgeDoc = {
  source: string;
  text: string;
};

export function knowledgeDir(): string {
  return path.join(process.cwd(), "knowledge");
}

export function loadDocuments(): KnowledgeDoc[] {
  const dir = knowledgeDir();
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((source) => ({
      source,
      text: readFileSync(path.join(dir, source), "utf8"),
    }));
}
