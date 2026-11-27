import { gateway } from "ai";
import { openai } from "@ai-sdk/openai";
import type { ReadyAiConfig } from "@/lib/ai/config";

export function resolveLanguageModel(config: ReadyAiConfig) {
  if (config.mode === "openai") return openai(config.chatModel);
  return gateway(config.chatModel);
}

export function resolveEmbeddingModel(config: ReadyAiConfig) {
  if (config.mode === "openai") return openai.embedding(config.embeddingModel);
  return gateway.embeddingModel(config.embeddingModel);
}
