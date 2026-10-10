import { useCallback, useState } from "react";
import { DEFAULTS } from "../lib/ollama.js";

const KEY = "support-chatbot-settings";

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      baseUrl: typeof saved.baseUrl === "string" && saved.baseUrl ? saved.baseUrl : DEFAULTS.baseUrl,
      model: typeof saved.model === "string" && saved.model ? saved.model : DEFAULTS.model,
      apiKey: typeof saved.apiKey === "string" ? saved.apiKey : DEFAULTS.apiKey,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Connection settings, kept in this browser's localStorage only. */
export function useSettings() {
  const [settings, setSettings] = useState(load);

  const save = useCallback((next) => {
    const clean = {
      baseUrl: next.baseUrl.trim() || DEFAULTS.baseUrl,
      model: next.model.trim() || DEFAULTS.model,
      apiKey: next.apiKey.trim(),
    };
    setSettings(clean);
    try {
      localStorage.setItem(KEY, JSON.stringify(clean));
    } catch {
      /* storage unavailable: settings last for this session only */
    }
  }, []);

  return [settings, save];
}
