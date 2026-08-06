# AI Career Inclusion Platform - Project Context

## Mission

Build an AI-powered career inclusion platform for India that helps underserved youth, especially rural and Tier-2/Tier-3 users, discover jobs, understand what those jobs actually involve, learn the required skills, and apply to suitable opportunities.

The platform should guide users through:

Awareness -> Understanding -> Learning -> Applying -> Employment

## Core Problems

1. Job discovery gap
   Many users do not know what public, private, apprenticeship, local, or government opportunities exist.

2. Job understanding gap
   Users may see a job title but not understand the daily work, eligibility, required skills, salary, growth path, or whether it fits their education/background.

3. Roadmap gap
   Users do not know what to study, which curriculum to follow, what resources to use, who to learn from, and how to become eligible.

## Product Vision

The product should not be a simple job board. It should be a career navigator that answers:

- What jobs am I eligible for today?
- What jobs can I become eligible for in 1, 3, or 6 months?
- What does this job actually involve?
- What skills am I missing?
- What free or low-cost resources should I follow?
- Which government schemes, apprenticeships, and exams should I know about?
- Where can I apply?

## Target Users

- 10th-pass, 12th-pass, ITI, diploma, graduate, and unemployed youth
- Rural and small-town users
- First-generation job seekers
- Users needing low-cost learning paths
- Users interested in government jobs, apprenticeships, private jobs, or self-employment

## Major Platform Modules

### 1. Opportunity Database

Stores real opportunities from:

- National Career Service
- SSC, UPSC, RRB, IBPS, state PSCs
- Apprenticeship portals such as NAPS and NATS
- Private job platforms such as Naukri, LinkedIn, Indeed, Foundit, Apna, WorkIndia
- Local livelihood and entrepreneurship opportunities

### 2. Occupation Knowledge Base

Explains careers in plain language:

- What the job is
- Daily tasks
- Required education
- Required skills
- Work environment
- Salary range
- Growth path
- Related occupations
- Intro videos and day-in-life content

Useful source families:

- National Classification of Occupations, India
- O*NET
- ESCO
- Government skill standards

### 3. Skill Database

Tracks:

- Skills required by jobs
- Skill importance
- Skill difficulty
- Skill-to-career mapping
- Skill-to-course mapping
- Skill gaps for each user

### 4. Learning Resource Database

Stores learning paths and resources:

- SWAYAM
- NPTEL
- Skill India
- PMKVY
- Coursera
- edX
- YouTube playlists
- Local language resources

### 5. Career Roadmap Engine

Generates and stores structured roadmaps:

- Step-by-step path
- Estimated time
- Estimated cost
- Required documents
- Exams/certifications
- Learning resources
- Practice tasks
- Application steps

### 6. AI Assistant

Uses retrieval-augmented generation over trusted data to answer:

- "I am 12th pass from Bihar. What jobs can I do?"
- "What does a solar technician do?"
- "How do I become a data entry operator in 3 months?"
- "Which government jobs can I apply for after 12th?"

## MVP Goal

Build a focused prototype that supports:

1. User profile input:
   - Education
   - State/district
   - Skills
   - Interest area
   - Preferred path: private job, government job, apprenticeship, self-employment

2. Career discovery:
   - Show eligible careers and opportunities
   - Explain each career simply
   - Show salary, eligibility, and demand

3. Skill gap:
   - Compare current skills with required skills
   - Show missing skills

4. Roadmap:
   - Generate a beginner-friendly roadmap
   - Attach learning resources and apply links

5. Data sources:
   - Start with curated seed data
   - Add scraping/API ingestion later

## Technical Direction

Start simple and reliable:

- Static prototype for product flow
- JSON seed data for occupations, skills, jobs, resources, and schemes
- Later migrate to full stack:
  - Frontend: React/Next.js
  - Backend: FastAPI or Node.js
  - Database: PostgreSQL
  - Search: PostgreSQL full text or Elasticsearch/OpenSearch
  - AI: RAG over occupation, job, and learning data

## Next Build Steps

1. Create seed dataset for 5-10 careers.
2. Build first UI flow: profile -> recommendations -> roadmap.
3. Add structured schema for future database migration.
4. Add ingestion scripts for public sources.
5. Add AI assistant once trusted data exists.
