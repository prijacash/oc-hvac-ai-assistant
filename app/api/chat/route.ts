import {
  createAgentUIStreamResponse,
  isStepCount,
  ToolLoopAgent,
  type UIMessage,
} from "ai";
import { connection } from "next/server";
import { getAiConfig } from "@/lib/ai/config";
import { lastUserText } from "@/lib/ai/messages";
import { resolveLanguageModel } from "@/lib/ai/models";
import { buildInstructions } from "@/lib/ai/prompt";
import { requestServiceAppointment } from "@/lib/appointments/tool";
import { retrieve } from "@/lib/knowledge/retrieve";

export const maxDuration = 60;

function safeError(error: unknown): string {
  const raw = error instanceof Error ? error.message : "unknown error";
  return raw.replace(/sk-[A-Za-z0-9_-]+/g, "sk-redacted").slice(0, 240);
}

export async function POST(request: Request) {
  await connection();
  const config = getAiConfig();
  if (!config.ok) {
    return Response.json({ error: config.message }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a chat message to start." }, { status: 400 });
  }

  const messages = (body as { messages?: UIMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Send a chat message to start." }, { status: 400 });
  }

  const recent = messages.slice(-30);
  const question = lastUserText(recent);
  if (!question) {
    return Response.json({ error: "Type a question about the shop." }, { status: 400 });
  }
  if (question.length > 4000) {
    return Response.json(
      { error: "That message is too long. Try a shorter question." },
      { status: 400 },
    );
  }

  try {
    const retrieval = await retrieve(question, 5);
    const agent = new ToolLoopAgent({
      model: resolveLanguageModel(config),
      instructions: buildInstructions(retrieval),
      tools: { requestServiceAppointment },
      stopWhen: isStepCount(4),
    });

    return await createAgentUIStreamResponse({
      agent,
      uiMessages: recent,
      abortSignal: request.signal,
      onError: (error) => {
        console.error("chat stream error:", safeError(error));
        return "The assistant could not finish that reply. Check the model key and try again.";
      },
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            sources: retrieval.chunks.map((chunk) => ({
              id: chunk.id,
              source: chunk.source,
              title: chunk.title,
            })),
            retrieval: retrieval.mode,
            weakMatch: retrieval.weakMatch,
          };
        }
        return undefined;
      },
    });
  } catch (error) {
    console.error("chat failed:", safeError(error));
    return Response.json(
      {
        error: "The assistant could not start. Check the model key and try again.",
      },
      { status: 500 },
    );
  }
}
