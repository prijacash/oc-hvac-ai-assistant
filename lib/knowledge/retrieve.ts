import { cosineSimilarity, embed, embedMany } from "ai";
import { resolveEmbeddingModel } from "@/lib/ai/models";
import type { ReadyAiConfig } from "@/lib/ai/config";
import { getAiConfig } from "@/lib/ai/config";
import { loadChunks, type KnowledgeChunk } from "@/lib/knowledge/chunk";

export type RetrievedChunk = KnowledgeChunk & { score: number };

export type RetrievalResult = {
  mode: "embedding" | "keyword";
  weakMatch: boolean;
  chunks: RetrievedChunk[];
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "is",
  "are",
  "do",
  "does",
  "did",
  "you",
  "your",
  "we",
  "our",
  "i",
  "me",
  "my",
  "what",
  "whats",
  "how",
  "much",
  "can",
  "could",
  "please",
  "about",
  "with",
  "from",
  "this",
  "that",
  "it",
  "if",
  "be",
  "will",
  "would",
  "there",
  "have",
  "has",
]);

type EmbeddingIndex = {
  key: string;
  chunks: Array<KnowledgeChunk & { embedding: number[] }>;
};

const globalStore = globalThis as { __ochvacEmbeddingIndex?: EmbeddingIndex };

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

export function rankByKeywords(
  query: string,
  chunks: KnowledgeChunk[],
  k: number,
): RetrievedChunk[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  const scored = chunks.map((chunk) => {
    const haystack = tokens(`${chunk.source} ${chunk.title} ${chunk.title} ${chunk.text}`);
    const counts = new Map<string, number>();
    for (const token of haystack) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    let score = 0;
    const seen = new Set<string>();
    for (const token of queryTokens) {
      const count = counts.get(token) ?? 0;
      if (count > 0) {
        score += 1 + Math.log(1 + count);
        seen.add(token);
      }
    }
    score += seen.size * 0.35;
    return { ...chunk, score };
  });

  const max = Math.max(...scored.map((item) => item.score), 0);
  if (max <= 0) return [];

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((item) => ({ ...item, score: item.score / max }));
}

function fingerprint(chunks: KnowledgeChunk[], model: string): string {
  let hash = 2166136261;
  const basis = `${model}\n${chunks.map((chunk) => chunk.text).join("\n")}`;
  for (let i = 0; i < basis.length; i += 1) {
    hash ^= basis.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

async function embeddingIndex(config: ReadyAiConfig, chunks: KnowledgeChunk[]) {
  const key = fingerprint(chunks, `${config.mode}:${config.embeddingModel}`);
  if (globalStore.__ochvacEmbeddingIndex?.key === key) {
    return globalStore.__ochvacEmbeddingIndex;
  }
  const { embeddings } = await embedMany({
    model: resolveEmbeddingModel(config),
    values: chunks.map((chunk) => `${chunk.title}\n${chunk.text}`),
    maxRetries: 1,
  });
  const index: EmbeddingIndex = {
    key,
    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index] ?? [],
    })),
  };
  globalStore.__ochvacEmbeddingIndex = index;
  return index;
}

export async function retrieve(query: string, k = 5): Promise<RetrievalResult> {
  const chunks = loadChunks();
  const config = getAiConfig();
  if (!config.ok) {
    return {
      mode: "keyword",
      weakMatch: false,
      chunks: rankByKeywords(query, chunks, k),
    };
  }

  try {
    const index = await embeddingIndex(config, chunks);
    const { embedding } = await embed({
      model: resolveEmbeddingModel(config),
      value: query,
      maxRetries: 1,
    });
    const ranked = index.chunks
      .map((chunk) => ({
        id: chunk.id,
        source: chunk.source,
        title: chunk.title,
        text: chunk.text,
        score: cosineSimilarity(embedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    const best = ranked[0]?.score ?? 0;
    return {
      mode: "embedding",
      weakMatch: best < 0.28,
      chunks: ranked,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "embedding failed";
    console.error("embedding retrieval failed:", message.slice(0, 180));
    return {
      mode: "keyword",
      weakMatch: false,
      chunks: rankByKeywords(query, chunks, k),
    };
  }
}
