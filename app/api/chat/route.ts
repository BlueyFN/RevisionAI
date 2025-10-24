import { NextRequest } from "next/server";

import {
  OPENAI_ENDPOINT,
  buildOpenAIRequestInit,
  buildOpenAIRequestPayload,
  logOpenAIError,
  type ChatMessage,
  type ChatRequestBody
} from "@/lib/openai";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ChatMessage).role === "string" &&
    typeof (value as ChatMessage).content === "string"
  );
}

function validateRequestBody(body: unknown): ChatRequestBody {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const { messages, sessionSummary, options } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    throw new Error("`messages` must be a non-empty array of message objects.");
  }

  if (sessionSummary !== undefined && typeof sessionSummary !== "string") {
    throw new Error("`sessionSummary` must be a string when provided.");
  }

  if (options !== undefined && (typeof options !== "object" || options === null)) {
    throw new Error("`options` must be an object when provided.");
  }

  return {
    messages,
    sessionSummary: sessionSummary as string | undefined,
    options: options as ChatRequestBody["options"]
  };
}

function toSSEChunk(data: string) {
  return textEncoder.encode(`data: ${data}\n\n`);
}

export async function POST(request: NextRequest) {
  let requestBody: ChatRequestBody;

  try {
    const body = await request.json();
    requestBody = validateRequestBody(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request payload.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const apiKey = process.env["OPENAI_API"];

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenAI API key is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const payload = buildOpenAIRequestPayload(requestBody);

  let openAIResponse: Response;

  try {
    openAIResponse = await fetch(OPENAI_ENDPOINT, buildOpenAIRequestInit(payload, apiKey));
  } catch (error) {
    logOpenAIError(error);
    return new Response(JSON.stringify({ error: "Failed to reach OpenAI service." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!openAIResponse.ok || !openAIResponse.body) {
    const errorText = await openAIResponse.text().catch(() => "");
    logOpenAIError(errorText || openAIResponse.statusText);

    return new Response(
      JSON.stringify({
        error: "OpenAI service returned an error.",
        status: openAIResponse.status,
        detail: errorText || openAIResponse.statusText
      }),
      {
        status: openAIResponse.status || 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const reader = openAIResponse.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            if (buffer.trim().length > 0) {
              controller.enqueue(toSSEChunk(buffer.trim()));
            }
            controller.enqueue(textEncoder.encode("event: close\ndata: [DONE]\n\n"));
            controller.close();
            break;
          }

          buffer += textDecoder.decode(value, { stream: true });
          const parts = buffer.split("\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) {
              continue;
            }

            controller.enqueue(toSSEChunk(trimmed));
          }
        }
      } catch (error) {
        logOpenAIError(error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked"
    }
  });
}
