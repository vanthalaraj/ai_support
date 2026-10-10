import { useCallback, useState } from "react";
import { askOllama, ChatError } from "../lib/ollama.js";

let counter = 0;
const newId = () => `m${Date.now()}-${counter++}`;

/** Holds the conversation and calls Ollama directly from the browser. */
export function useChat(language, settings, t) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(
    async (history) => {
      setLoading(true);
      setError("");
      try {
        const reply = await askOllama({
          history: history.map(({ role, content }) => ({ role, content })),
          language,
          settings,
        });
        setMessages([...history, { id: newId(), role: "assistant", content: reply }]);
      } catch (err) {
        const code = err instanceof ChatError ? err.code : "service";
        setError(t.errors[code] || t.errors.service);
      } finally {
        setLoading(false);
      }
    },
    [language, settings, t]
  );

  const send = useCallback(
    (text) => {
      const content = text.trim();
      if (!content || loading) return false;
      const next = [...messages, { id: newId(), role: "user", content }];
      setMessages(next);
      request(next);
      return true;
    },
    [messages, loading, request]
  );

  const retry = useCallback(() => {
    if (loading || messages.length === 0) return;
    if (messages[messages.length - 1].role === "user") request(messages);
  }, [messages, loading, request]);

  const clear = useCallback(() => {
    if (loading) return;
    setMessages([]);
    setError("");
  }, [loading]);

  return { messages, loading, error, send, retry, clear };
}
