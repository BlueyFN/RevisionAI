export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  top_p?: number;
  max_output_tokens?: number;
  [key: string]: unknown;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  sessionSummary?: string;
  options?: ChatOptions;
}

export interface OpenAIResponseChunk {
  id?: string;
  object?: string;
  status?: string;
  type?: string;
  response?: unknown;
  error?: {
    message?: string;
    type?: string;
    param?: string;
    code?: string;
  };
}

export const OPENAI_ENDPOINT = 'https://api.openai.com/v1/responses';

export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful assistant that continues the conversation based on the provided context.';

export function buildOpenAIRequestPayload({
  messages,
  sessionSummary,
  options = {},
}: ChatRequestBody) {
  const payloadMessages: ChatMessage[] = [];

  if (sessionSummary) {
    payloadMessages.push({
      role: 'system',
      content: `Previous session summary:\n${sessionSummary}`,
    });
  }

  payloadMessages.push({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
  payloadMessages.push(...messages);

  return {
    model: 'gpt-5',
    modality: 'text',
    input: payloadMessages,
    stream: true,
    ...options,
  };
}

export function buildOpenAIRequestInit(payload: unknown, apiKey: string): RequestInit {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  };
}

export function logOpenAIError(error: unknown) {
  if (error instanceof Error) {
    console.error('[OpenAI] Error:', error.message, error.stack);
  } else {
    console.error('[OpenAI] Unexpected error:', error);
  }
}
