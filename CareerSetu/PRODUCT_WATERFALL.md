# CareerSetu Platform Waterfall

## Product Goal

CareerSetu helps entry-level Indian job seekers discover realistic jobs, understand their skill gaps, learn what matters for each role, and apply with confidence.

The product is not only a job board. It is a guided career assistant for users who may not know job titles, portals, eligibility rules, application steps, or what to learn next.

## Primary Users

- 10th pass, 12th pass, ITI, diploma, and fresh graduate users.
- Tier-2 and Tier-3 users who prefer simple chat-style discovery.
- Users looking for fresher-friendly private jobs, apprenticeships, public portal jobs, and low-barrier government/public opportunities.
- Users who may need local language, voice, document help, and practical learning guidance.

## Core User Flow

1. User opens the platform.
2. First screen shows only a simple chat with heading and subheading.
3. User writes something like: "I am from Rajasthan, 12th pass, know computer."
4. System extracts location, education, skills, preference, and intent.
5. System searches ranked job opportunities using filters plus semantic matching.
6. User sees relevant jobs with clear cards.
7. User opens a job to see work, requirements, apply path, and fit.
8. User creates a skill guide based on their own skills and the selected role.
9. User saves jobs, tracks applied jobs, and revisits generated roadmaps.
10. Later versions support local language, voice, profile reuse, and application autofill.

## What We Have Built

- Local prototype running at `http://127.0.0.1:5173/`.
- Chat-first job discovery UI.
- Public/private opportunity dataset loaded from local data files.
- Current dataset size: about 200+ opportunities.
- Internal filters for state, education, category, and preference.
- Semantic search endpoint using embeddings when available.
- OpenRouter-backed profile extraction and skill guide generation.
- Fallback rule-based extraction and guide logic.
- Saved jobs section.
- Applied jobs section.
- Roadmaps section.
- Resume/skills text input.
- Loader states for search and guide generation.
- Cleaner labels for public/private/apprenticeship listings.
- Master prompt for practical, non-generic job guidance.

## Current Product Gaps

- Dataset is still small and not balanced across all states.
- NCS coverage needs stronger scraping and deduplication.
- Apprenticeship India data needs broader ingestion.
- Private jobs need better state/category coverage.
- Job quality scoring needs improvement to reduce fake, vague, stale, or high-experience roles.
- Profile is still stored lightly in browser state, not a real user account.
- Resume parsing is basic and does not parse PDF/DOCX deeply yet.
- Learning resources are not deeply mapped to each role.
- Roadmap caching is local only.
- Application tracking is basic.
- UI still needs mobile-first testing with real users.

## Data Source Strategy

### Public Sources

- NCS public listings.
- Apprenticeship India.
- State job portals where useful.
- Government/public skill portals.
- Public exam notifications for entry-level government roles.

### Private Sources

- JobSpy-supported private listings.
- Indeed-style public job pages where allowed.
- Local private jobs and walk-in jobs where data can be collected ethically.
- Employer/public company career pages for fresher roles.

### Data Quality Rules

- Prefer fresher-friendly roles.
- Prefer salary up to roughly 50k/month for the first product version.
- Keep public and private jobs separate internally but show them simply to users.
- Deduplicate by title, organization, location, and apply URL.
- Penalize vague job descriptions.
- Penalize unrealistic salaries.
- Penalize jobs requiring high experience.
- Flag missing apply links.
- Normalize state, education, pay, skills, category, and source type.

## Search And Matching Framework

### Input Understanding

The user may type incomplete natural language. The system should extract:

- State or city.
- Education level.
- Known skills.
- Preferred job type.
- Language preference.
- Comfort areas such as computer, talking to customers, field work, technical work, or government exams.

### Matching Layers

1. Hard filters remove only impossible jobs.
2. Soft filters reduce rank but keep flexible jobs visible.
3. Semantic search catches natural language intent.
4. Skill matching explains why a job is suitable.
5. Skill gaps feed the roadmap.

### Why Not Only Filters

Users will not always know exact categories. A person may write "I know computer" instead of "data entry, office assistant, back office, computer operator." Semantic search and skill expansion are required.

## AI Layer

### Current AI Use

- Profile extraction from chat.
- Skill guide generation.
- Embedding-based semantic search.

### AI Principles

- Do not expose "LLM", "cache", "scraper", or file names in the user interface.
- Keep guidance practical and role-specific.
- Avoid generic course recommendations.
- Explain what is learned before applying and what is usually learned on the job.
- Store generated roadmaps so repeated requests can reuse them.

### Future AI Features

- Resume parsing and profile enrichment.
- Personalized roadmap for all matched jobs.
- Role-specific mock interviews.
- Application answer drafting.
- Resume tailoring for selected role.
- Local-language conversation and translation.
- Voice input and voice output.

## Learning Layer

The platform should show users exactly how to prepare.

Useful learning assets:

- YouTube videos in local languages.
- Free practice tasks.
- Mock interview questions.
- Job-specific scripts, such as customer support call practice.
- Government skill portals.
- NSDC/Skill India resources where relevant.
- Simple daily practice plans.
- Documents checklist.

For roles like customer support, the guidance should not say "take a generic course" first. It should focus on listening, speaking clearly, handling basic computer tools, confidence, patience, and mock conversations because product/process knowledge is often taught on the job.

## Profile System

The profile system should eventually store:

- Name and contact details.
- State, city, preferred work locations.
- Education.
- Skills.
- Languages.
- Resume.
- Documents available.
- Job interests.
- Saved jobs.
- Applied jobs.
- Generated roadmaps.
- Application history.

Profile data should help:

- Search better jobs.
- Auto-fill common application details.
- Generate role-specific resumes.
- Generate practical learning plans.
- Avoid asking the same questions repeatedly.

## Local Language And Voice

This is important for Tier-3 adoption.

Options:

- Vakyam AI for Indian language voice/language support.
- Open-source speech-to-text and translation models.
- Browser speech input for early prototype.
- Text translation layer before profile extraction and roadmap generation.

Goal:

- User can speak/type in their own language.
- System understands intent.
- Results and roadmaps can be shown in the user's preferred language.

## UI Principles

- First screen should be chat-only with strong heading and subheading.
- Do not show complex filters first.
- Keep navigation visible.
- After first search, show chat at top and results below.
- Use simple words: saved, applied, roadmap, apply, learn next.
- Use large enough tap targets.
- Avoid cluttered source/debug labels.
- Keep job cards readable with employer, location, pay, minimum education, match, and next step.
- Mobile experience should feel close to chat apps users already understand.

## Near-Term Build Plan

### Phase 1: Better First Experience

- Chat-only first screen.
- Beige/soft background.
- Clear animated heading.
- Results open only after the first query.
- Chat remains at top after entering the app.

### Phase 2: Profile System

- Save user profile in local storage first.
- Add editable profile summary.
- Add document checklist.
- Add copy-ready application details.
- Later move to Neon/Postgres.

### Phase 3: Better Dataset

- Improve NCS ingestion.
- Improve Apprenticeship India ingestion.
- Expand private entry-level jobs.
- Normalize all states.
- Add fake/stale job filters.
- Increase to 400-500 quality opportunities.

### Phase 4: Learning Resources

- Map skills to YouTube/resource links.
- Add role-specific learning cards.
- Add mock interview practice.
- Add simple 7-day/14-day plans.

### Phase 5: Local Language

- Add text language selection.
- Add Hindi/Bengali/Rajasthani style responses.
- Add voice input.
- Evaluate Vakyam AI and open-source alternatives.

### Phase 6: Apply Assistant

- One-click copy profile details.
- Resume tailoring.
- Cover note/application answer generation.
- Applied job tracker with status.
- Reminder system.

## Database Direction

Local storage is acceptable for the prototype.

Use Neon/Postgres when we need:

- Real user accounts.
- Cross-device saved jobs.
- Shared roadmap cache.
- Larger job database.
- Admin ingestion pipeline.
- Analytics and product learning.

Suggested future tables:

- users
- profiles
- opportunities
- opportunity_embeddings
- saved_jobs
- applications
- roadmaps
- learning_resources
- ingestion_runs
- source_quality_scores

## Success Metrics

- User can find relevant jobs in one message.
- Search results match state and education correctly.
- User understands why each job is shown.
- User can tell what to learn next.
- User can save and apply without confusion.
- Roadmaps feel practical, not generic.
- Tier-3 users can use it without knowing job portal terminology.

