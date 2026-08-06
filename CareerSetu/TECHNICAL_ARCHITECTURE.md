# CareerSetu Technical Architecture

## Purpose

This document records how the current prototype works and how the technical system should evolve as CareerSetu moves from local prototype to usable product.

The core technical goal is simple: a user should describe their background in natural language, and the platform should return realistic jobs, explain fit, create practical learning paths, and help with applying.

## Current Prototype

### Runtime

- Frontend: plain HTML, CSS, and JavaScript.
- Backend: Node.js server in `prototype/server.js`.
- Local URL: `http://127.0.0.1:5173/`.
- Host binding: `HOST`, default `127.0.0.1`; use `0.0.0.0` for cloud hosting.
- Data: local JSON files under `data/`.
- AI provider: OpenRouter through server-side API calls.
- Environment: project root `.env`, loaded by `prototype/server.js`.
- Skill guide model: `OPENROUTER_GUIDE_MODEL`, default `openai/gpt-4o`, separate from cheaper profile extraction.
- Embeddings: generated and stored locally in `data/job_embeddings.json`.
- Speech-to-text: OpenRouter transcription endpoint using `OPENROUTER_STT_MODEL`, default `openai/gpt-4o-transcribe`.
- Storage: browser `localStorage` for saved jobs, applied jobs, and generated guide cache.

### Important Files

- `prototype/index.html`: app structure and first-screen markup.
- `prototype/styles.css`: visual system, intro mode, app layout, cards, modals, loaders.
- `prototype/app.js`: frontend state, ranking, rendering, saved/applied/skill-guide logic.
- `prototype/server.js`: static server and AI API endpoints.
- `data/opportunities.json`: primary opportunity dataset.
- `data/enriched_opportunities.json`: normalized/enriched job display data.
- `data/job_embeddings.json`: embedding vectors for semantic search.
- `data/learning_resources.json`: early resource dataset.
- `prompts/career_guide_master_prompt.md`: skill guide generation prompt.
- `scripts/ingest_ncs.py`: NCS ingestion work.
- `scripts/ingest_jobspy.py`: private job ingestion work.
- `scripts/ingest_apprenticeship.py`: apprenticeship ingestion work.
- `scripts/enrich_opportunities.py`: enrichment pipeline.
- `scripts/generate_job_embeddings.js`: embedding generation.
- `.env`: local secrets and model configuration. Ignored by git.
- `.env.example`: safe env template.
- `CareerSetu/DEPLOYMENT.md`: local and future deployment instructions.

## Current Application Flow

### First Screen

1. Page loads in `intro-mode`.
2. User sees nav, large heading, subheading, and chat input only.
3. Background uses soft beige visual treatment.
4. User submits the first message by clicking the send button or pressing Enter.

### Search Flow

1. User types or records voice.
2. If voice is used, frontend records browser audio and auto-stops after 5 seconds of silence.
3. Frontend calls `/api/transcribe`.
4. Server sends base64 audio to OpenRouter speech-to-text.
5. Transcript is placed into the chat box.
6. Frontend calls `/api/normalize-intent`.
7. Server converts raw typed/voice text from any Whisper-supported language into normalized English plus structured profile JSON.
8. App switches from `intro-mode` to `app-mode`.
9. Extracted profile updates hidden internal controls.
10. Frontend calls `/api/profile-extract` as a compatibility/fallback pass.
11. Frontend calls `/api/semantic-search`.
12. Server embeds the normalized English query and compares it with stored job embeddings.
13. Frontend combines semantic score with deterministic ranking rules.
14. Results render as matched opportunities.

### Job Detail Flow

1. User clicks a job card.
2. Detail panel shows match score, employer, location, pay, education, role work, requirements, checklist, and apply link.
3. User can save the job, mark it applied, or create a skill guide.

### Skill Guide Flow

1. User opens skill guide for a job.
2. Dialog shows only a voice action, not a typing box.
3. User speaks what they already know in their own language.
4. Recording auto-stops after 5 seconds and calls `/api/transcribe`.
5. Frontend calls `/api/normalize-intent` for the skill-guide transcript.
6. Frontend calls `/api/skill-guide` with job context, user context, detected language, normalized English, and target language.
7. Server sends job context and user context to the master prompt through `OPENROUTER_GUIDE_MODEL`.
8. Guide returns readiness, matched skills, missing skills, what to learn before applying, what is learned on the job, learning plan, YouTube search suggestions, and interview practice.
9. User-facing guide text is returned in the detected language and also in English through `english_guide`.
10. Guide is stored in local guide cache with language included in the cache key.

## Backend Endpoints

### `GET /api/health`

Purpose:

- Confirm server status.
- Confirm whether `OPENROUTER_API_KEY` is loaded without exposing it.
- Confirm configured chat, embedding, and speech-to-text models.
- Confirm local data files exist.

### `GET /api/openrouter-check`

Purpose:

- Confirm the server can reach OpenRouter over outbound HTTPS.
- Return HTTP status, latency, and low-level network cause without exposing the API key.

### `POST /api/profile-extract`

Input:

```json
{
  "text": "I am from West Bengal, 12th pass, know computer"
}
```

Output shape:

```json
{
  "state": "West Bengal",
  "education": "12th pass",
  "skills": ["basic-computer"],
  "category": "office_computer",
  "preference": "any"
}
```

Purpose:

- Convert natural language into structured search fields.
- Keep a local fallback because AI may fail or API may be unavailable.

### `POST /api/normalize-intent`

Input:

```json
{
  "text": "म बरहव पस ह रजसथन स",
  "source": "voice"
}
```

Output shape:

```json
{
  "raw_transcript": "म बरहव पस ह रजसथन स",
  "detected_language": "hi",
  "normalized_english": "I am 12th pass from Rajasthan",
  "profile": {
    "state": "Rajasthan",
    "district": "",
    "education": "12th pass",
    "degree": "",
    "skills": [],
    "experience": "",
    "goal": "job_now",
    "preferred_categories": [],
    "language": "hi"
  },
  "confidence": 0.62
}
```

Purpose:

- Preserve raw transcript and detected/source language.
- Convert rough STT output from Indian languages, Hinglish, Punjabi, Bengali, English, and other Whisper-supported languages into stable English intent.
- Feed deterministic filters and semantic search with structured fields instead of raw noisy transcript text.
- Keep a local fallback for common rough Hindi/Devanagari cases such as `बरहव` for 12th pass and `रजसथन` for Rajasthan.

### `POST /api/semantic-search`

Input:

```json
{
  "query": "12th pass Rajasthan computer job",
  "limit": 60
}
```

Output:

```json
{
  "matches": [
    {
      "id": "job-id",
      "score": 0.82
    }
  ]
}
```

Purpose:

- Support natural language job matching.
- Catch related roles even when the user does not know exact job titles.

### `POST /api/transcribe`

Input:

```json
{
  "audioBase64": "base64-audio-bytes",
  "format": "webm",
  "language": "hi"
}
```

Output:

```json
{
  "text": "मैं राजस्थान से हूं और मुझे कंप्यूटर आता है",
  "usage": {},
  "model": "openai/gpt-4o-transcribe"
}
```

Purpose:

- Convert user voice into text.
- Support Indian-language and Hinglish search entry.
- Feed the same transcript into profile extraction, semantic search, and ranking.

### `POST /api/skill-guide`

Input:

```json
{
  "userProfile": {
    "education": "12th pass",
    "state": "West Bengal",
    "skills": ["basic-computer"],
    "language": "bn"
  },
  "targetLanguage": "bn",
  "targetLanguageLabel": "Bengali",
  "normalizedEnglish": "I am 12th pass from West Bengal and know computer.",
  "knownSkills": ["excel", "basic-computer"],
  "userText": "I know Excel and typing",
  "job": {}
}
```

Output:

```json
{
  "language": "bn",
  "target_language": "Bengali",
  "readiness": "Can try now",
  "summary": "Practical fit summary",
  "matched_skills": [],
  "missing_skills": [],
  "learn_before_applying": [],
  "learn_on_the_job": [],
  "learning_plan": [],
  "youtube_searches": [],
  "interview_practice": [],
  "english_guide": {
    "summary": "English version of the same guide",
    "learn_before_applying": [],
    "learn_on_the_job": [],
    "learning_plan": [],
    "youtube_searches": [],
    "interview_practice": [],
    "apply_checklist": []
  }
}
```

Purpose:

- Give practical, role-specific guidance.
- Avoid generic course recommendations.
- Explain realistic expectations for the job.
- Use the stronger guide model separately from cheaper profile extraction.
- Show explanations, learning guidance, interview practice, and checklist items in the user's detected language when available.
- Always include an English version through `english_guide` when the user's detected language is not English.
- Include practical YouTube search phrases instead of invented video links.

## Frontend State

### Global Data

- `data.opportunities`: normalized job records.
- `data.skills`: skill ID to label mapping.
- `currentIntent`: extracted intent terms.
- `selectedOpportunityId`: current selected job.
- `semanticMatches`: map of job ID to embedding score.
- `currentGuideOpportunity`: job selected for skill guide.

### Browser Storage Keys

- `careersetu.savedJobs`: saved jobs.
- `careersetu.applications`: applied jobs.
- `careersetu.guideCache`: generated skill guides.

These are acceptable for prototype. They should move to a real database when user accounts are introduced.

## Current Matching Logic

The ranking system is hybrid.

### Hard Checks

- Education must meet minimum when the role has a strict minimum.
- State/location should strongly affect matching when the user mentions a state. Hidden default state should not accidentally filter results.
- Preference can prioritize private jobs, government exams, or apprenticeships.

### Soft Checks

- Preferred education should boost but not always block.
- Missing good-to-have skills should lower rank but keep the job visible.
- Flexible private jobs should stay visible when the user can learn on the job.

### Education And Degree Checks

- 12th-pass users should not see graduate-only jobs.
- Graduate users can still see 12th-pass flexible jobs, but those jobs should rank lower unless they also mention graduate eligibility or strongly match the user's skills.
- B.Com users should get accounting, finance, billing, Tally, GST, bookkeeping, invoice, and office roles boosted.
- B.Tech/B.E users should get engineering, technical, technician, trainee, maintenance, quality, site, IT support, and apprentice-style roles boosted.
- BBA and BCA users should get their own role-family boosts.
- Displayed match score remains capped at 100, but internal sorting should use the raw score so degree-relevant jobs can rise above generic jobs.

### Semantic Checks

- User query is embedded.
- Job embeddings are compared.
- Semantic score uses an enriched query that includes extracted education, degree stream, and related role terms, not only the raw chat message.
- Semantic score boosts relevant roles even if exact keywords do not match.

### Intent-Family Checks

- Skill-only queries must map to role families, not broad keywords.
- Example: "typing" should strongly prefer data entry, computer operator, back office, office assistant, form filling, and documentation roles.
- Example: "typing" should penalize CA articleship, chartered accountant, accounting, GST, TDS, Tally, audit, and finance roles unless the user also mentions B.Com/accounting intent.
- Positive semantic similarity is not enough. The matcher also needs negative constraints so professional roles do not appear just because they contain generic words like records, office, or documentation.

### Why Hybrid Search

Only filters are too rigid. Only AI is too unpredictable. Hybrid search gives:

- Predictable location and education behavior.
- Better natural language understanding.
- Explainable ranking.
- Lower API cost.

## Data Model Direction

### Opportunity Record

Target normalized opportunity fields:

```json
{
  "id": "stable-id",
  "title": "Customer Support Executive",
  "source_type": "private_job",
  "source_name": "Private listing",
  "organization": "Company name",
  "state": "West Bengal",
  "location": "Kolkata",
  "min_education_hard": "12th pass",
  "education_preferred": ["graduate"],
  "salary_or_stipend": "15000-25000 per month",
  "fresher_friendly": true,
  "skills_must_have": ["communication"],
  "skills_good_to_have": ["basic-computer", "customer-service"],
  "category": "sales_service",
  "description": "Clean role description",
  "apply_url": "https://...",
  "posted_date": "2026-07-04",
  "confidence": "medium"
}
```

### Profile Record

Future user profile fields:

```json
{
  "id": "user-id",
  "name": "User name",
  "phone": "Phone number",
  "email": "Email",
  "state": "Rajasthan",
  "city": "Jaipur",
  "education": "12th pass",
  "skills": ["basic-computer", "typing"],
  "languages": ["Hindi", "English"],
  "preferred_job_types": ["private_job"],
  "resume_text": "Parsed resume text",
  "documents": {
    "id_proof": true,
    "education_proof": true,
    "resume": true
  }
}
```

## Database Plan

### Prototype

Use:

- Local JSON for job data.
- `localStorage` for user-side saved/applied/generated guides.

This is enough for iteration and UI testing.

### Production

Use Neon/Postgres or similar.

Suggested tables:

- `users`
- `profiles`
- `opportunities`
- `opportunity_embeddings`
- `saved_jobs`
- `applications`
- generated guides
- `learning_resources`
- `ingestion_runs`
- `source_quality_scores`

### Why Database Is Needed Later

- Cross-device access.
- User accounts.
- Shared generated-guide cache.
- Analytics.
- Admin review of listings.
- Better ingestion tracking.
- Avoid regenerating the same AI outputs repeatedly.

## Data Pipeline

### Current Pipeline

1. Ingest jobs from source scripts.
2. Normalize fields.
3. Enrich job descriptions.
4. Build `opportunities.json`.
5. Build `enriched_opportunities.json`.
6. Generate embeddings.
7. Serve data locally.

### Target Pipeline

1. Fetch raw jobs from public/private sources.
2. Store raw records.
3. Normalize schema.
4. Deduplicate.
5. Score quality and fraud risk.
6. Enrich skills and requirements.
7. Generate embeddings.
8. Publish approved records.
9. Track source freshness.

## Quality And Fake Job Filtering

Each listing should get a quality score.

Signals:

- Has real organization.
- Has valid apply URL.
- Has realistic salary.
- Has clear location.
- Has clear role description.
- Does not demand high experience for fresher role.
- Does not use suspicious payment/training-fee language.
- Is not duplicated.
- Is not stale.

Low-quality jobs should be hidden or shown with lower priority.

## Learning Resource System

Target resource schema:

```json
{
  "id": "resource-id",
  "skill": "communication",
  "role_category": "sales_service",
  "language": "Hindi",
  "type": "youtube",
  "title": "Customer support call practice",
  "url": "https://...",
  "duration_minutes": 20,
  "difficulty": "beginner",
  "why_useful": "Helps practice speaking and listening"
}
```

Resources should be mapped by:

- Skill.
- Role category.
- Education level.
- Language.
- Difficulty.
- Practicality.

## Local Language And Voice Architecture

### Early Version

- User types or speaks in any language.
- Server translates or interprets intent.
- Result text can be generated in selected language.

### Voice Version

1. User speaks.
2. Browser records audio and sends it to `/api/transcribe`.
3. OpenRouter speech-to-text converts audio to text.
4. Text is normalized to English/Hindi internal representation.
5. Existing profile extraction and search run.
6. Response is shown in selected language.
7. Optional text-to-speech reads guidance.

### Providers To Evaluate

- OpenRouter speech-to-text models such as `openai/gpt-4o-transcribe`.
- Vakyam AI for future production comparison.
- Open-source Indian language speech models.
- Browser speech APIs for prototype only.
- Translation models for Hindi, Bengali, Rajasthani, Marathi, Tamil, Telugu, and other target languages.

## Security And Privacy

Important rules:

- Do not expose API keys in frontend.
- Keep OpenRouter calls server-side only.
- Do not store sensitive profile data in plain local storage for production.
- Ask before storing resume or personal documents.
- Use HTTPS in production.
- Do not disable TLS verification in production.
- Keep user data deletion possible.
- Log errors without logging private resume content.

## Performance

Prototype is fine with local JSON.

Production needs:

- Pagination.
- Server-side search.
- Vector index for embeddings.
- Cached AI responses.
- Background ingestion jobs.
- Lightweight frontend bundles.
- Mobile-first loading.

## UI Engineering Principles

- First interaction should be chat-only.
- Avoid exposing internal implementation words.
- Keep visible controls simple.
- Keep filters internal unless user asks for advanced controls.
- Make job cards scannable.
- Always show why a job matched.
- Always show what to do next.
- Use loaders while AI/search is working.
- Keep mobile layout readable.

## Testing Checklist

Manual checks after every UI/API change:

- App loads at `http://127.0.0.1:5173/`.
- First screen shows only nav, heading, subheading, and chat.
- Pressing Enter in chat opens the app.
- Search for "Maharashtra" does not show unrelated Assam-only results at top.
- Search for "I am BCom" should rank accounting/finance/office roles above generic 12th-pass jobs.
- Search for "I am 12th pass" should not show graduate-only jobs.
- Job card click opens details.
- Skill guide modal opens.
- Guide generation shows loader.
- Saved jobs tab works.
- Applied jobs tab works.
- Skill guide generation works.
- No user-facing text says `LLM`, `cache`, `opportunities.json`, or `scraper`.

Command checks:

```powershell
node --check prototype\app.js
node --check prototype\server.js
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173/ | Select-Object -ExpandProperty StatusCode
```

## Immediate Engineering Roadmap

### Step 1: Stabilize Prototype UX

- Complete intro screen and app-mode behavior.
- Improve mobile layout.
- Clean job card detail hierarchy.
- Add stronger empty/error states.

### Step 2: Profile System

- Save profile in local storage.
- Add profile review/edit screen.
- Add copy-ready application details.
- Add basic resume parsing beyond `.txt`.

### Step 3: Data Expansion

- Improve NCS ingestion.
- Improve Apprenticeship India ingestion.
- Add private entry-level coverage.
- Expand to 400-500 quality jobs.
- Add job quality/fraud scoring.

### Step 4: Learning Layer

- Build curated learning resource data.
- Match resources to missing skills.
- Add role-specific practice tasks.
- Add local-language YouTube links.

### Step 5: Database Migration

- Move jobs and generated guides to Neon/Postgres.
- Add user accounts.
- Add shared generated-guide cache.
- Add ingestion run logs.

### Step 6: Local Language And Voice

- Add language selector.
- Add multilingual input handling.
- Add voice input.
- Evaluate Vakyam AI and open-source alternatives.

## Engineering Decisions To Revisit

- Whether to keep plain JavaScript or move to React/Next.js.
- Whether to use Neon with pgvector or a separate vector database.
- Which embedding model gives best cost/quality.
- Which speech/language provider is best for Indian languages.
- How much of the skill guide should be generated live versus precomputed.
- How to verify and moderate private job sources.
