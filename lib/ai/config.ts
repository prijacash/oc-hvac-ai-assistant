import { company, setupMessage } from "@/lib/company";

const DEFAULT_CHAT_MODEL = "openai/gpt-5.4-mini";
const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export type ReadyAiConfig = {
  ok: true;
  mode: "gateway" | "openai";
  chatModel: string;
  embeddingModel: string;
};

export type AiConfig =
  | ReadyAiConfig
  | {
      ok: false;
      message: string;
    };

function present(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function withProvider(value: string | undefined, fallback: string): string {
  const raw = present(value) ?? fallback;
  return raw.includes("/") ? raw : `openai/${raw}`;
}

function stripProvider(value: string): string {
  const slash = value.indexOf("/");
  return slash === -1 ? value : value.slice(slash + 1);
}

export function getAiConfig(): AiConfig {
  const chatModel = withProvider(process.env.AI_MODEL, DEFAULT_CHAT_MODEL);
  const embeddingModel = withProvider(
    process.env.EMBEDDING_MODEL,
    DEFAULT_EMBEDDING_MODEL,
  );
  const gatewayKey = present(process.env.AI_GATEWAY_API_KEY);
  const oidc = present(process.env.VERCEL_OIDC_TOKEN);
  const onVercel = process.env.VERCEL === "1";
  const openaiKey = present(process.env.OPENAI_API_KEY);

  if (gatewayKey || oidc || onVercel) {
    return { ok: true, mode: "gateway", chatModel, embeddingModel };
  }
  if (openaiKey) {
    return {
      ok: true,
      mode: "openai",
      chatModel: stripProvider(chatModel),
      embeddingModel: stripProvider(embeddingModel),
    };
  }
  return { ok: false, message: setupMessage };
}

export function statusPayload() {
  const config = getAiConfig();
  if (!config.ok) {
    return {
      configured: false,
      provider: null,
      chatModel: null,
      embeddingModel: null,
      message: config.message,
      company: company.name,
    };
  }
  return {
    configured: true,
    provider: config.mode,
    chatModel: config.chatModel,
    embeddingModel: config.embeddingModel,
    message: null,
    company: company.name,
  };
}
