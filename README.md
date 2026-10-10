# AI Customer Support Chatbot (client-only)

React + Vite. The browser calls Ollama's `/api/chat` directly. There is no server.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Open **Settings** in the sidebar and enter your Ollama API key, model and URL.
They are saved in this browser's localStorage only.

- Hosted Ollama: URL `https://ollama.com`, API key required.
- Local Ollama: URL `http://localhost:11434`, no key needed. Start Ollama with
  `OLLAMA_ORIGINS=*` (or your site's origin) so the browser is allowed to call it.

## Deploy to Netlify

1. Push this folder to GitHub (the folder containing `package.json` and `netlify.toml` must be the repo root).
2. Netlify > Add new site > Import from Git. The settings are read from `netlify.toml`:
   build command `npm run build`, publish directory `dist`.
3. Deploy. The SPA redirect (`netlify.toml` and `public/_redirects`) prevents "Page not found".

Or drag and drop: run `npm run build` and upload the `dist` folder.

Optional build-time defaults (Netlify > Site settings > Environment variables):
`VITE_OLLAMA_BASE_URL`, `VITE_OLLAMA_MODEL`.

## Security note

Without a server, any API key the browser uses is visible to that user. That is why
the key is typed into Settings rather than baked into the build. Do not set it as a
`VITE_` variable on a public site: it would ship in the JavaScript for everyone.

## CORS

Browsers only allow the call if the Ollama endpoint sends CORS headers. If chat
shows "Can't reach Ollama" while your key and URL are right, the endpoint is
blocking browser requests and a small proxy (e.g. a Netlify Function) is the fix.
