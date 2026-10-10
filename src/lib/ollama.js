// Talks to Ollama straight from the browser. There is no backend.

export const MAX_HISTORY = 12; // most recent messages sent to the model
export const MAX_CONTENT = 4000; // characters per message
const TIMEOUT_MS = 60_000;

export const DEFAULTS = {
  baseUrl: (import.meta.env.VITE_OLLAMA_BASE_URL || "https://ollama.com").trim(),
  model: (import.meta.env.VITE_OLLAMA_MODEL || "gemma4:31b").trim(),
  apiKey: "",
};

const BASE_PROMPT =
  "You are a helpful customer-support assistant. " +
  "Be polite and concise. Do not invent order status, " +
  "refund outcomes, company policies, or account details. " +
  "If business-specific information is unavailable, say so " +
  "and offer to connect the customer with a human agent.";

const LANGUAGE_PROMPTS = {
  en: "Reply in English.",
  te: "Reply in Telugu (తెలుగు) unless the customer clearly writes in another language.",
};

export function isLocalUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

/** A key is only required for hosted Ollama, not for a local instance. */
export function isConfigured(settings) {
  return Boolean(settings.apiKey.trim()) || isLocalUrl(settings.baseUrl);
}

export class ChatError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // "config" | "auth" | "network" | "timeout" | "service" | "empty"
  }
}

export async function askOllama({ history, language, settings }) {
  if (!isConfigured(settings)) throw new ChatError("config");

  const messages = history
    .slice(-MAX_HISTORY)
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content?.trim())
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CONTENT) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    throw new ChatError("service");
  }

  const lang = LANGUAGE_PROMPTS[language] ? language : "en";
  const headers = { "Content-Type": "application/json" };
  if (settings.apiKey.trim()) headers.Authorization = `Bearer ${settings.apiKey.trim()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${settings.baseUrl.replace(/\/+$/, "")}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "system", content: `${BASE_PROMPT} ${LANGUAGE_PROMPTS[lang]}` },
          ...messages,
        ],
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new ChatError("timeout");
    // fetch() rejects with a TypeError for network failures *and* CORS blocks.
    throw new ChatError("network");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 || res.status === 403) throw new ChatError("auth");
  if (!res.ok) throw new ChatError("service");

  const data = await res.json().catch(() => null);
  const reply = data?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) throw new ChatError("empty");
  return reply.trim();
}
