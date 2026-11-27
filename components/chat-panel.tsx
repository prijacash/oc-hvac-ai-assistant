"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { AppointmentCard } from "@/components/appointment-card";
import { SampleConversation } from "@/components/sample-conversation";
import { APPOINTMENT_TOOL, type ChatMessage } from "@/lib/chat/types";
import { isAppointmentResult } from "@/lib/appointments/types";

const starters = [
  "What cities do you serve?",
  "How much is a diagnostic visit?",
  "What is included in Comfort Club?",
  "I smell gas. What should I do?",
  "I'd like to book a repair in Irvine.",
];

type SetupState =
  | { kind: "loading" }
  | { kind: "ready"; provider: string; chatModel: string }
  | { kind: "missing"; message: string };

export function ChatPanel() {
  const [setup, setSetup] = useState<SetupState>({ kind: "loading" });
  const [input, setInput] = useState("");
  const [showSample, setShowSample] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((response) => response.json())
      .then((data: { configured?: boolean; provider?: string; chatModel?: string; message?: string }) => {
        if (cancelled) return;
        if (data.configured && data.provider && data.chatModel) {
          setSetup({ kind: "ready", provider: data.provider, chatModel: data.chatModel });
          setShowSample(false);
        } else {
          setSetup({
            kind: "missing",
            message: data.message ?? "Add a model key to start the assistant.",
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSetup({
            kind: "missing",
            message: "The status check failed. Refresh the page and try again.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";
  const ready = setup.kind === "ready";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !ready || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
    setShowSample(false);
  }

  return (
    <section
      id="assistant"
      aria-label="Customer assistant"
      className="scroll-mt-4 flex h-[min(42rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_20px_50px_rgba(28,25,21,0.08)] lg:sticky lg:top-4"
    >
      <header className="border-b border-line px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Ask the shop assistant</h2>
            <p className="text-xs text-ink/65">
              Answers stay inside the fictional notes and cite the file.
            </p>
          </div>
          <StatusPill setup={setup} busy={busy} />
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {setup.kind === "missing" && (
          <div className="rounded-2xl border border-amber bg-amber/40 p-3 text-sm leading-6">
            <p className="font-semibold">Setup needed before live answers</p>
            <p className="mt-1">{setup.message}</p>
          </div>
        )}
        {error && (
          <p className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-950">
            {error.message || "The assistant could not answer. Check the model key and try again."}
          </p>
        )}
        {messages.length === 0 && showSample && <SampleConversation />}
        {messages.map((message) => (
          <MessageView key={message.id} message={message} />
        ))}
        {busy && (
          <p className="text-sm text-ink/60 motion-reduce:animate-none">Looking that up…</p>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {starters.map((question) => (
            <button
              key={question}
              type="button"
              disabled={!ready || busy}
              onClick={() => submit(question)}
              className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-left text-xs disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <form
        className="border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <label htmlFor="assistant-input" className="sr-only">
          Message the assistant
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="assistant-input"
            rows={2}
            value={input}
            disabled={!ready || busy}
            placeholder={ready ? "Ask about a repair, a price range, or a visit" : "Add a model key to type here"}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit(input);
              }
            }}
            className="min-h-14 flex-1 resize-none rounded-2xl border border-line bg-paper px-3 py-2 text-sm disabled:opacity-60"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!ready || input.trim().length === 0}
              className="rounded-full bg-orange px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          )}
        </div>
        {ready && (
          <p className="mt-2 text-[11px] text-ink/55">
            {setup.provider === "gateway" ? "AI Gateway" : "OpenAI"} · {setup.chatModel}
            {messages.length === 0 && (
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => setShowSample((value) => !value)}
              >
                {showSample ? "Hide sample" : "Show sample"}
              </button>
            )}
          </p>
        )}
      </form>
    </section>
  );
}

function StatusPill({ setup, busy }: { setup: SetupState; busy: boolean }) {
  const label =
    setup.kind === "loading"
      ? "Checking"
      : setup.kind === "missing"
        ? "Key needed"
        : busy
          ? "Answering"
          : "Ready";
  return (
    <span className="rounded-full bg-paper px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
      {label}
    </span>
  );
}

function MessageView({ message }: { message: ChatMessage }) {
  const user = message.role === "user";
  return (
    <div className={user ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          user
            ? "max-w-[90%] rounded-2xl rounded-br-md bg-ink px-3 py-2 text-sm leading-6 text-cream"
            : "max-w-[95%] space-y-2 rounded-2xl rounded-bl-md border border-line bg-paper px-3 py-2 text-sm leading-6"
        }
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <p key={`${message.id}-text-${index}`} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }
          if (part.type === `tool-${APPOINTMENT_TOOL}`) {
            return <ToolView key={`${message.id}-tool-${index}`} part={part} />;
          }
          return null;
        })}
        {!user && message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
              Sources
              {message.metadata.retrieval === "keyword" ? " · keyword match" : ""}
              {message.metadata.weakMatch ? " · weak match" : ""}
            </p>
            <ul className="mt-1 flex flex-wrap gap-1">
              {message.metadata.sources.map((source) => (
                <li
                  key={source.id}
                  className="rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal-deep"
                >
                  {source.source} · {source.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolView({ part }: { part: ChatMessage["parts"][number] }) {
  if (!("state" in part)) return null;
  if (part.state === "output-available" && "output" in part && isAppointmentResult(part.output)) {
    return <AppointmentCard result={part.output} />;
  }
  if (part.state === "output-error" && "errorText" in part) {
    return <p className="text-red-900">The booking tool failed: {part.errorText}</p>;
  }
  return <p className="text-ink/60">Checking that request against the booking rules…</p>;
}
