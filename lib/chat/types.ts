import type { UIMessage } from "ai";

export type SourceCitation = {
  id: string;
  source: string;
  title: string;
};

export type ChatMetadata = {
  sources?: SourceCitation[];
  retrieval?: "embedding" | "keyword";
  weakMatch?: boolean;
};

export type ChatMessage = UIMessage<ChatMetadata>;

export const APPOINTMENT_TOOL = "requestServiceAppointment";
