# CareerSetu

CareerSetu helps entry-level Indian job seekers find nearby work using simple chat or voice.

The user does not need to understand filters, job portals, or keywords. They can say something like:

```text
I am from Rajasthan, 12th pass, I know typing and basic computer. What jobs can I do?
```

CareerSetu converts that into a profile, searches the local job knowledge base, shows suitable opportunities, and helps the user understand what they need to learn before applying.

## Why This Exists

Most job portals are built for people who already know how to search. Many tier 2 and tier 3 users do not search like that. They describe themselves in natural language:

- where they live
- how much they studied
- what skills they know
- what language they are comfortable in
- whether they want fresher jobs
- whether they can relocate or travel

CareerSetu is designed around that behavior. The product goal is not only "show jobs". The goal is:

- find relevant jobs from public and private sources
- explain why a job matches the user
- show the skill gap in simple language
- guide the user on what to learn next
- help the user apply with less confusion
- support Indian languages and voice-first access

## What The User Can Do Today

1. Open the app.
2. Type or speak what they know.
3. CareerSetu understands the user's education, state, skills, and intent.
4. The app shows matching job cards.
5. The user can open a job detail view.
6. The user can save jobs.
7. The user can mark jobs as applied.
8. The user can use the voice-only skill guide for a selected job.
9. The skill guide explains what the user already matches, what is missing, and how to learn it.
10. The guide is shown in English and, when detected, the user's language.

## Current Jobs Data

The current prototype uses local JSON data files under `data/`.

Current snapshot:

- Total jobs: `207`
- Fresher-friendly jobs: `207`
- Private jobs from JobSpy/Indeed-style scraping: `203`
- Public/NCS jobs: `4`
- Embeddings file: available in `data/job_embeddings.json`
- Enriched job summaries: available in `data/enriched_opportunities.json`

Current job categories:

| Category | Count |
| --- | ---: |
| Office / computer work | 98 |
| General entry-level | 44 |
| Sales / service | 41 |
| Logistics / delivery / warehouse | 11 |
| Financial services | 7 |
| Technical trade | 5 |
| Government exam / public role | 1 |

Current education split:

| Minimum education | Count |
| --- | ---: |
| ITI | 152 |
| 10th pass | 42 |
| 12th pass | 7 |
| Graduate | 6 |

Important limitation: the current dataset is an early seed, not a complete India-wide job database. Location text exists inside jobs, but state fields are not perfectly normalized yet. The next data improvement should normalize state, district, city, salary, source quality, and apply method for every job.

## Data Sources

Current and planned data sources:

| Source | Type | Current status | Notes |
| --- | --- | --- | --- |
| JobSpy / Indeed-style scraping | Private jobs | Used in current dataset | Useful for fresher private roles like support, sales, office, accounts, delivery, and computer jobs. |
| NCS.gov.in | Public/government-backed portal | Small sample used | Needs better scraping and cleaning because a reliable open API was not confirmed. |
| Apprenticeship India | Public apprenticeship source | Planned | Useful for ITI, diploma, 10th/12th pass, and fresher apprenticeship roles. |
| State job portals | Public jobs | Planned | Needed for state-specific government and semi-government opportunities. |
| Direct employer pages | Private jobs | Planned | Useful for cleaner apply links and reducing fake jobs. |

The long-term system should run scheduled ingestion jobs, clean and verify listings, remove fake/spam jobs, and store jobs in a real database.

## How Search Works

CareerSetu does not depend only on fixed filters.

The current search flow is:

1. User enters text or voice.
2. Voice is converted to text when needed.
3. The text is normalized into English and structured profile fields.
4. The app extracts intent such as state, education, skills, and job type.
5. The query is sent for semantic matching.
6. Embeddings are compared with job embeddings.
7. Rule-based ranking adjusts results for practical constraints like education, location, role intent, and fresher suitability.
8. The UI shows the most relevant opportunities first.

Example:

```text
User: I am 12th pass from Rajasthan and I know typing.
```

The app should prefer jobs like:

- data entry
- back office
- computer operator
- customer support
- office assistant

It should avoid showing unrelated roles like CA articleship unless the user's education and intent match that role.

## AI Usage

CareerSetu uses AI only where it improves the user experience:

| Feature | Model use |
| --- | --- |
| Voice search | Speech-to-text through OpenRouter |
| Language normalization | Converts regional language or Hinglish into English intent |
| Profile extraction | Finds education, state, skills, and constraints from free text |
| Semantic search | Uses embeddings to match meaning, not only exact keywords |
| Skill guide | Uses a stronger chat model to create a practical job-specific guide |

The product should not show technical words like "LLM", "cache", or "embeddings" to the end user. Those are internal implementation details.

## Language Support

The current app is designed for English plus Indian-language voice/text input.

Current normalization supports these language labels:

- English
- Hindi / Hinglish
- Bengali / Bangla
- Marathi
- Punjabi
- Gujarati
- Tamil
- Telugu
- Kannada
- Malayalam
- Odia
- Assamese
- Urdu

The current speech-to-text path uses OpenRouter. Later, Vakyam AI or another Indian-language voice stack can be added for better tier 3 voice quality.

## Skill Guide

The skill guide is built for practical learning, not generic course recommendations.

For a selected job, the user speaks what they already know. CareerSetu then creates:

- job readiness summary
- matched skills
- missing skills
- what to learn before applying
- what can be learned on the job
- daily work expectations
- practice tasks
- YouTube search suggestions
- interview practice questions
- apply checklist
- questions to ask the employer
- English guide plus regional-language guide when available

For example, for customer support, the guide should not blindly recommend long courses. It should explain that many things are learned on the job, while the user should improve communication, phone confidence, basic computer usage, typing, and simple customer handling.

## Product Roadmap

Next product improvements:

- better job ingestion from NCS and Apprenticeship India
- source quality scoring to detect fake or low-quality jobs
- proper state, district, city, salary, and apply-link normalization
- user profile system so users do not repeat their details
- resume/profile builder for copying details into job applications
- persistent saved jobs, applied jobs, and generated skill guides
- better vector database using Postgres/Neon plus pgvector
- better multilingual voice using Vakyam AI or similar Indian-language tooling
- curated learning resources with real YouTube channels, local courses, and interview examples
- admin panel for reviewing imported jobs before publishing

## Project Structure

```text
api/
  index.js                         Vercel serverless entry point
CareerSetu/
  DEPLOYMENT.md                    Deployment notes
  TECHNICAL_ARCHITECTURE.md        Engineering architecture
  PRODUCT_WATERFALL.md             Product plan
data/
  opportunities.json               Current job dataset
  enriched_opportunities.json      Cleaned summaries and guide context
  job_embeddings.json              Local vector embeddings for semantic search
prompts/
  career_guide_master_prompt.md    Skill guide master prompt
prototype/
  index.html                       UI shell
  app.js                           Frontend logic
  styles.css                       UI styling
  server.js                        Local server and API handler
scripts/
  generate_job_embeddings.js       Embedding generation script
```

## Run Locally

Requirements:

- Node.js 18 or newer
- OpenRouter API key

Create the environment file:

```powershell
copy .env.example .env
```

Add your key in `.env`:

```env
OPENROUTER_API_KEY=your_key_here
```

Start the app:

```powershell
npm start
```

Open:

```text
http://127.0.0.1:5173/
```

Check the server:

```text
http://127.0.0.1:5173/api/health
```

## Environment Variables

```env
PORT=5173
HOST=127.0.0.1
OPENROUTER_API_KEY=
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_GUIDE_MODEL=openai/gpt-4o
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_STT_MODEL=openai/gpt-4o-transcribe
```

For deployed hosting, use:

```env
HOST=0.0.0.0
```

Never commit `.env`.

## Deploy On Vercel

This repo includes:

- `api/index.js`
- `vercel.json`

That allows Vercel to run the same app as a serverless Node function.

Steps:

1. Push this repo to GitHub.
2. Go to Vercel.
3. Import the GitHub repo.
4. Set the framework preset to `Other`.
5. Add environment variables:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_CHAT_MODEL=openai/gpt-4o-mini
OPENROUTER_GUIDE_MODEL=openai/gpt-4o
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_STT_MODEL=openai/gpt-4o-transcribe
HOST=0.0.0.0
```

6. Deploy.
7. After deployment, open:

```text
https://your-vercel-domain.vercel.app/api/health
```

If `openRouterConfigured` is `true`, the AI features are configured.

## Development Checks

Run syntax checks:

```powershell
npm run check
```

Regenerate embeddings after changing jobs:

```powershell
npm run embeddings
```

## Current Status

CareerSetu is a working prototype. It already demonstrates the core idea:

- voice-first job search
- multilingual intent normalization
- semantic job matching
- saved/applied job sections
- practical skill guide generation

The biggest next step is data quality. Better data will make the product feel much more useful than a normal job search page.
