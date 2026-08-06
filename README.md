# CareerSetu

CareerSetu is a voice-first job discovery and skill-guide prototype for Indian entry-level job seekers. Users can describe their education, state, and skills in English or regional languages, see matching jobs, and generate a practical bilingual skill guide for a selected job.

## Current Prototype

- Chat and voice job search.
- OpenRouter speech-to-text.
- Language normalization into English structured profile fields.
- Hybrid job matching using local filters, semantic embeddings, and ranking rules.
- Voice-only skill guide flow.
- Skill guide shown in the user's detected language plus English.
- Saved and applied job tracking in browser storage.

## Run Locally

Requires Node.js 18+.

```powershell
copy .env.example .env
```

Paste your OpenRouter key into `.env`:

```env
OPENROUTER_API_KEY=your_key_here
```

Start the server:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:5173/
```

## Environment

Important variables:

```env
PORT=5173
HOST=127.0.0.1
OPENROUTER_API_KEY=
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_GUIDE_MODEL=openai/gpt-4o
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_STT_MODEL=openai/gpt-4o-transcribe
```

For cloud hosting, set:

```env
HOST=0.0.0.0
```

Never commit `.env`.

## Checks

```powershell
npm run check
```

## Health

```text
http://127.0.0.1:5173/api/health
http://127.0.0.1:5173/api/openrouter-check
```

## Key Docs

- `CareerSetu/DEPLOYMENT.md`
- `CareerSetu/TECHNICAL_ARCHITECTURE.md`
- `CareerSetu/DEMO_SCRIPT.md`
- `CareerSetu/PRODUCT_WATERFALL.md`

## Current Data

The prototype uses local JSON files under `data/`. Later versions should move jobs, user profiles, saved/applied records, and generated guides to Postgres/Neon with pgvector.

