# CareerSetu Build Completion Plan

## Purpose

This document is the execution checklist for completing CareerSetu from the current prototype into a stronger usable MVP.

Use this file to decide what to build next, what is already complete, and what still needs product/engineering work.

## Product North Star

CareerSetu should help an entry-level job seeker answer three questions:

1. What jobs can I realistically apply for?
2. What skills or documents am I missing?
3. What exactly should I do next to learn and apply?

The experience should stay chat-first, simple, practical, and useful for Tier-2/Tier-3 Indian users.

## Current Status Summary

### Completed Enough For Prototype

- Chat-only first screen.
- App-mode after first chat.
- Navigation for Discover, Roadmaps, Saved, Applied.
- Local job dataset loading.
- Job cards and job detail panel.
- Saved jobs in browser storage.
- Applied jobs in browser storage.
- Skill guide modal.
- Roadmap storage in browser storage.
- OpenRouter-backed profile extraction.
- OpenRouter-backed skill guide generation.
- Embedding-backed semantic search endpoint.
- Degree-aware ranking for B.Com, B.Tech/B.E, BBA, BCA.
- Documentation folder with product and technical docs.

### Partially Done

- Data ingestion from NCS, JobSpy/private jobs, and Apprenticeship India.
- Job quality/fake-job filtering.
- Learning resources.
- Resume/profile capture.
- UI polish and mobile ergonomics.
- Roadmap reuse/caching.
- Local language support.
- Application assistant.
- Database design.

### Not Yet Built

- Real user accounts.
- Neon/Postgres storage.
- Server-side saved jobs/applications/roadmaps.
- Admin review dashboard for jobs.
- Real PDF/DOCX resume parsing.
- Voice input/output.
- Full local-language flow.
- Automated learning resource retrieval and ranking.
- Production deployment.

## Module Plan

## 1. First Experience And UI

### Current State

- First screen is chat-only with nav, heading, subheading, and chat input.
- After the first message, the app opens into search/results mode.
- UI has basic loader states and improved layout.

### Problems To Fix

- Mobile still needs visual QA.
- Job cards can be more scannable.
- Detail panel can be simplified further for low-confidence users.
- Empty/error states need stronger copy and actions.
- The app should feel more like a guided assistant than a static dashboard.

### Completion Criteria

- First screen is clean and fast.
- User understands what to type without reading instructions.
- Results are readable on mobile.
- Job detail shows only important information first.
- Every action has visible feedback.

### Tasks

- Improve mobile layout for 360px, 390px, 768px, and desktop.
- Add better empty state when no matches are found.
- Add clearer match explanation on each card.
- Add stronger selected job state.
- Reduce visual clutter in job detail.
- Add a compact top chat bar in app mode.

## 2. Search, Matching, And Personalization

### Current State

- Hybrid ranking uses hard filters, soft filters, semantic score, skills, category, source type, and education.
- Degree-aware logic has been added for B.Com, B.Tech/B.E, BBA, and BCA.
- Hidden default state no longer filters unless the user mentions state.

### Problems To Fix

- Semantic search still depends on quality of job embeddings and job text.
- Education and skill extraction should be tested across many real phrases.
- Current matching is mostly frontend-side.
- Result diversity is not controlled yet.
- Some job categories are too broad.

### Completion Criteria

- 12th pass, ITI, B.Com, B.Tech, BBA, BCA users should get noticeably different top results.
- State-based queries should prioritize correct state.
- Generic flexible jobs should remain visible but not dominate.
- User sees why every job matched.

### Tasks

- Add test queries and expected top categories.
- Add query-debug function for internal testing only.
- Improve category normalization.
- Add result diversity so top 20 do not repeat the same title/company.
- Move ranking logic toward backend when database is added.
- Regenerate embeddings after data enrichment changes.

## 3. Data Sources And Job Database

### Current State

- Local dataset has about 200+ opportunities.
- Sources include private listings, NCS work, and apprenticeship work.
- Scripts exist for ingestion and enrichment.

### Problems To Fix

- Dataset is not balanced across states.
- NCS count is too low.
- Apprenticeship India ingestion needs expansion.
- Private job quality varies.
- Duplicate and vague records still exist.
- Salary, education, and experience normalization need improvement.

### Completion Criteria

- 400-500 quality entry-level opportunities.
- Coverage across most Indian states.
- Public + private + apprenticeship data represented.
- Fake/stale/high-experience listings are filtered or penalized.
- Every listing has normalized education, category, location, skills, and apply path.

### Tasks

- Improve NCS scraping/collection.
- Improve Apprenticeship India collection.
- Expand private fresher-friendly jobs through JobSpy.
- Add deduplication by title, organization, location, and URL.
- Add quality scoring.
- Add stale-job detection.
- Add salary sanity checks.
- Add experience-level filtering.
- Regenerate enriched data and embeddings.

## 4. Skill Gap And Roadmaps

### Current State

- User can generate a skill guide from job detail.
- Guide uses job context and user skills.
- Roadmaps are stored locally and shown in Roadmaps tab.
- Prompt avoids generic course advice.

### Problems To Fix

- User should not have to generate one-by-one manually for every job.
- Roadmaps need more learning resources.
- Roadmaps should be personalized from a saved profile/resume.
- The app should separate "learn before applying" vs "learn on job" clearly.

### Completion Criteria

- User can create a profile once.
- Top jobs can show automatic fit summary from that profile.
- Skill guide gives realistic next steps.
- Generated roadmap can be reopened later.
- Roadmap includes free learning/practice resources.

### Tasks

- Add profile-based automatic mini skill-gap on job cards.
- Add bulk roadmap generation for selected/top jobs later.
- Improve guide UI with sections: ready now, learn first, learned on job, practice.
- Add role-specific practice tasks.
- Add learning resources from curated dataset.
- Persist roadmap by user profile + job ID.

## 5. Learning Resources

### Current State

- Early `learning_resources.json` exists.
- Skill guide can mention learning steps.

### Problems To Fix

- Resources are not deeply mapped to roles/skills.
- No YouTube resource retrieval/ranking yet.
- No local-language resource preference.
- No practical exercise library.

### Completion Criteria

- Missing skills map to specific free resources.
- Resources are beginner-friendly.
- Resources are language-aware.
- Every roadmap contains at least one practice task.

### Tasks

- Build curated resource dataset by skill and language.
- Add YouTube links for common skills: Excel, typing, customer support, communication, Tally, interview basics.
- Add role-specific practice tasks.
- Add resource ranking by language, difficulty, and role.
- Show resources inside skill guide.

## 6. Profile System

### Current State

- User can type skills and attach/paste basic resume text.
- Saved/applied/roadmaps use browser storage.
- There is no full profile screen yet.

### Problems To Fix

- Profile is not easy to review or edit.
- Resume parsing is weak.
- Application details cannot be copied easily.
- No persistent account-level storage.

### Completion Criteria

- User can create/edit a simple profile.
- Profile stores education, state, city, skills, languages, documents, and job preferences.
- Profile improves search and roadmaps.
- User can copy application details.

### Tasks

- Add Profile tab or profile drawer.
- Save profile to local storage first.
- Add document checklist.
- Add copy-ready details section.
- Parse `.txt` resume better.
- Add PDF/DOCX parsing later.
- Move profile to database later.

## 7. Apply Assistant

### Current State

- Apply link opens source.
- User can mark job as applied.
- Applied jobs are listed.

### Problems To Fix

- No real application workflow support.
- No status tracking beyond applied.
- No copy-ready profile/application answers.
- No reminders.

### Completion Criteria

- User knows exactly where and how to apply.
- User can track application status.
- User can copy required details.
- User gets checklist before applying.

### Tasks

- Add statuses: saved, ready to apply, applied, follow-up, rejected, selected.
- Add application checklist per job.
- Add copy profile button.
- Add short application note generator.
- Add role-specific resume tailoring later.

## 8. Local Language And Voice

### Current State

- Planned but not built.
- Options discussed: Vakyam AI, open-source speech/language models, browser speech APIs for prototype.

### Problems To Fix

- Tier-3 users may not type English comfortably.
- User should be able to use Hindi/Bengali/Rajasthani and other languages.
- Voice can reduce friction.

### Completion Criteria

- User can type in local language.
- System extracts intent correctly.
- Results and guides can be shown in selected language.
- Voice input works in prototype.

### Tasks

- Add language selector.
- Add frontend language preference.
- Add multilingual profile extraction prompt.
- Add translation/normalization layer.
- Add browser speech input as prototype.
- Evaluate Vakyam AI for production-grade language/voice.

## 9. Database And Backend

### Current State

- Local JSON files.
- Browser local storage.
- Node server endpoints.

### Problems To Fix

- No real persistence.
- No user accounts.
- No server-side search index.
- No shared roadmap cache.

### Completion Criteria

- Jobs are stored in a database.
- User profile, saved jobs, applied jobs, and roadmaps persist server-side.
- Embeddings are stored with jobs.
- Search can run server-side.

### Tasks

- Choose Neon/Postgres.
- Define schema and migrations.
- Add `opportunities`, `profiles`, `saved_jobs`, `applications`, `roadmaps`, `learning_resources`.
- Move JSON loading to database query.
- Add vector search with pgvector or separate vector store.
- Add server-side roadmap cache.

## 10. Production Readiness

### Current State

- Local prototype only.
- API key is server-side in environment variable.
- TLS workaround was used locally earlier for testing only.

### Problems To Fix

- No production hosting.
- No auth.
- No privacy controls.
- No admin/data moderation.

### Completion Criteria

- Hosted securely.
- API keys not exposed.
- User data protected.
- Data sources reviewed.
- Basic analytics in place.

### Tasks

- Choose deployment target.
- Add environment variable setup.
- Add HTTPS-safe API calls.
- Add user data deletion/export plan.
- Add logging without private resume content.
- Add admin review for listings.

## Recommended Build Order From Here

### Sprint 1: Make Search Trustworthy

Goal: user sees different and relevant jobs for 12th pass, ITI, B.Com, B.Tech, and state-based searches.

Tasks:

- Add internal query test cases.
- Improve result diversity.
- Improve category/education normalization.
- Add quality score display internally.
- Regenerate embeddings after data cleanup.

### Sprint 2: Build Profile System

Goal: user enters information once and the platform keeps using it.

Tasks:

- Add profile screen/drawer.
- Save profile in local storage.
- Show profile summary after chat.
- Use profile for skill gaps and search.
- Add copy-ready application details.

### Sprint 3: Improve Skill Guide And Learning

Goal: roadmap becomes actually useful, not generic.

Tasks:

- Add learning resources mapped to skills.
- Add practice tasks.
- Improve guide UI.
- Add automatic mini skill-gap on each job card.

### Sprint 4: Expand And Clean Data

Goal: 400-500 quality jobs across states.

Tasks:

- Improve NCS.
- Improve Apprenticeship India.
- Expand private jobs.
- Add dedupe, quality scoring, fake-job checks.

### Sprint 5: Local Language Prototype

Goal: user can type/speak in their preferred language.

Tasks:

- Add language selector.
- Add multilingual extraction.
- Add Hindi/Bengali output option.
- Add browser voice input prototype.

## What We Should Complete First

The next best work is:

1. Search trust and data quality.
2. Profile system.
3. Learning resources inside skill guide.
4. UI/mobile polish.

Reason:

If search is weak, the product fails at the first promise. If profile is missing, personalization stays shallow. If learning resources are weak, the roadmap feels generic. These three decide whether users can actually get value.

