# CareerSetu Deployment And Environment

## Local Environment

Secrets must stay server-side. Do not place API keys in `prototype/index.html`, `prototype/app.js`, or any browser JavaScript.

The local server loads environment variables from:

1. Existing shell environment variables.
2. `.env` in the project root.

Shell variables win over `.env` values.

## Required File

Create or edit this file:

```text
D:\Ashish project\Economic Opp\.env
```

Required values:

```env
PORT=5173
HOST=127.0.0.1
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_GUIDE_MODEL=openai/gpt-4o
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_STT_MODEL=openai/gpt-4o-transcribe
```

`.env` is ignored by git. `.env.example` is committed as the safe template.

## Start Locally

From project root:

```powershell
npm start
```

Or:

```powershell
node --use-system-ca prototype\server.js
```

Or:

```powershell
.\scripts\start-careersetu.ps1
```

Open:

```text
http://127.0.0.1:5173/
```

Check server configuration:

```text
http://127.0.0.1:5173/api/health
```

This confirms whether the server loaded `OPENROUTER_API_KEY`. It never prints the key.

Check whether the server can reach OpenRouter:

```text
http://127.0.0.1:5173/api/openrouter-check
```

## AI Features Controlled By OpenRouter

`OPENROUTER_API_KEY` enables:

- Profile extraction from natural language.
- Semantic search embeddings.
- Personalized skill guide generation through `OPENROUTER_GUIDE_MODEL`.
- Voice transcription through `openai/gpt-4o-transcribe`.

Without the key, the prototype still opens, but AI-backed features use fallbacks or fail gracefully.

If `OPENROUTER_API_KEY` is configured but AI calls still fail, check machine network access to:

```text
https://openrouter.ai
```

The local app needs outbound HTTPS access from Node.js.

On Windows, the start scripts use Node's `--use-system-ca` flag so Node trusts the Windows certificate store. This is important on networks that inspect HTTPS traffic.

## Future Hosted Deployment

For production or staging, set the same variables in the hosting provider's environment settings instead of uploading `.env`.

Set this for hosted environments:

```env
HOST=0.0.0.0
```

Recommended future deployment shape:

- Frontend and Node server hosted together for the prototype.
- API key only available to the Node server.
- Postgres/Neon with pgvector for searchable jobs.
- Separate background ingestion worker for NCS, JobSpy, and apprenticeship data.

## Docker

Build:

```powershell
docker build -t careersetu .
```

Run:

```powershell
docker run --env-file .env -e HOST=0.0.0.0 -p 5173:5173 careersetu
```

Open:

```text
http://127.0.0.1:5173/
```

## GitHub Push Checklist

Before pushing:

```powershell
npm.cmd run check
git status --short
git add .
git status --short
```

Confirm `.env` is not listed. If it appears, stop and remove it from git tracking before pushing.

First push to GitHub after creating an empty repository:

```powershell
git commit -m "Initial CareerSetu prototype"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If `npm run check` is allowed in your shell, it is equivalent to `npm.cmd run check`. On this Windows machine, `npm.cmd` avoids PowerShell execution policy issues.
