import type { UIMessage } from "ai";

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function lastUserText(messages: UIMessage[]): string {
  const users = messages.filter((message) => message.role === "user");
  const last = users.at(-1);
  if (!last) return "";
  const latest = textOf(last);
  const previous = users.at(-2);
  if (previous && latest.length > 0 && latest.length < 48) {
    return `${textOf(previous)}\n${latest}`.trim();
  }
  return latest;
}
