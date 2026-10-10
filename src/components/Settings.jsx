import { useState } from "react";

export default function Settings({ t, settings, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(settings);

  function toggle() {
    if (!open) setDraft(settings);
    setOpen(!open);
  }

  function submit(event) {
    event.preventDefault();
    onSave(draft);
    setOpen(false);
  }

  const field = (name) => ({
    value: draft[name],
    onChange: (e) => setDraft({ ...draft, [name]: e.target.value }),
  });

  return (
    <div className="side-group">
      <div className="side-actions">
        <button type="button" onClick={toggle} aria-expanded={open}>
          {t.settings}
        </button>
      </div>

      {open && (
        <form className="settings" onSubmit={submit}>
          <label>
            <span>{t.apiKey}</span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="ollama api key"
              {...field("apiKey")}
            />
          </label>
          <label>
            <span>{t.model}</span>
            <input type="text" spellCheck={false} {...field("model")} />
          </label>
          <label>
            <span>{t.baseUrl}</span>
            <input type="url" spellCheck={false} {...field("baseUrl")} />
          </label>
          <p className="hint">{t.keyHint}</p>
          <button type="submit" className="save">
            {t.save}
          </button>
        </form>
      )}
    </div>
  );
}
