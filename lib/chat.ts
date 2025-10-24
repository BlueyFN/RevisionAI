import { summarizeText } from "@/lib/utils";
import type { ChatMessage } from "@/components/message-list";

export interface SessionPayload {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  systemNote?: string;
}

export const MAX_CONTEXT_MESSAGES = 12;
export const MIN_MESSAGES_BEFORE_SUMMARY = 6;

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now()
  };
}

export function summarizeMessages(messages: ChatMessage[]): string {
  const bulletPoints = messages.map((message) => {
    const prefix = message.role === "user" ? "Student" : "Tutor";
    return `${prefix}: ${message.content.replace(/\s+/g, " ").trim()}`;
  });
  return summarizeText(bulletPoints.join("\n"), 500);
}

export function trimContext(
  messages: ChatMessage[],
  existingNote = ""
): { trimmed: ChatMessage[]; note?: string } {
  if (messages.length <= MAX_CONTEXT_MESSAGES) {
    return { trimmed: messages, note: existingNote || undefined };
  }

  const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
  const older = messages.slice(0, -MAX_CONTEXT_MESSAGES);
  const summaryText = summarizeMessages(older);
  const note = existingNote
    ? summarizeText(`${existingNote}\n${summaryText}`, 600)
    : summaryText;

  const noteMessage: ChatMessage = {
    id: `note-${Date.now()}`,
    role: "note",
    content: note,
    createdAt: Date.now()
  };

  return { trimmed: [noteMessage, ...recent], note };
}

export function inferTitleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  if (!firstUser) return "Untitled";
  return summarizeText(firstUser.content, 40);
}
