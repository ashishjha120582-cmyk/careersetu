# Data Value Strategy

## Goal

The platform should create real user value by connecting four things that are usually fragmented:

1. Opportunity: what can I apply for?
2. Understanding: what is this job actually like?
3. Skill gap: what am I missing?
4. Upskilling roadmap: how do I become eligible?

The product should avoid being a generic AI chatbot or another job-board clone. It should act as a structured career pathway system.

## Core Product Thesis

Users do not only need more job listings. They need a trustworthy answer to:

> Given my education, location, skills, language, and money constraints, what should I do next?

That answer requires multiple data layers.

## Data Layers

### 1. Live Opportunity Layer

Purpose:

- Show what the user can apply for now.
- Surface private jobs, government jobs, apprenticeships, job fairs, and local opportunities.

Best sources:

- National Career Service
- Apprenticeship India / NAPS
- NATS
- SSC, UPSC, RRB, IBPS, state PSCs
- Private job platforms where compliant API/wrapper access is possible

User value:

- "Here are opportunities open near you or nationally."
- "Here are deadlines and eligibility requirements."
- "Here is the official application link."

Risk:

- Raw listings can be noisy, duplicated, outdated, or difficult to understand.

Product rule:

- Never show raw listings alone. Always attach eligibility, skill match, missing skills, and next action.

### 2. Career Understanding Layer

Purpose:

- Explain what a job means in real life.
- Convert job titles into practical understanding.

Best sources:

- National Career Service career information
- O*NET occupation data
- ESCO skills/occupation taxonomy
- National Classification of Occupations
- Sector Skill Council qualification packs where available

User value:

- "What does this person do daily?"
- "Is this indoor, outdoor, desk, field, physical, customer-facing, or exam-based work?"
- "What kind of person is this suitable for?"

Product rule:

- Every career page must explain daily tasks, work environment, required education, core skills, salary range, growth path, and beginner suitability.

### 3. Skill Gap Layer

Purpose:

- Compare user profile against job/career requirements.
- Separate "eligible today" from "reachable after training."

Best sources:

- Skills extracted from job descriptions
- O*NET skills, knowledge, abilities, tasks
- ESCO skills
- Sector skill standards
- Manually reviewed seed skill maps

User value:

- "You already have 3 of 5 required skills."
- "Learn these 2 skills first."
- "This path is realistic in 30/60/90 days."

Product rule:

- Skill gap should be explainable. Do not give only a black-box AI score.

### 4. Upskilling Resource Layer

Purpose:

- Give a practical learning path.
- Prefer free, Hindi/regional, beginner-friendly, trusted resources.

Best sources:

- SWAYAM
- NPTEL
- Skill India Digital Hub
- PMKVY / Skill India programs
- YouTube Data API for carefully ranked explainer/playlists
- State skill development portals

User value:

- "Watch this first to understand the job."
- "Complete this free course."
- "Practice these tasks."
- "Then apply here."

Product rule:

- Resources must be attached to specific missing skills, not listed generically.

### 5. Support and Guidance Layer

Purpose:

- Help users who need human or community support.

Best sources:

- NCS counsellors and career centers
- Model Career Centers
- Government training centers
- Verified NGOs
- Verified mentors and educators

User value:

- "Here is where you can get help near you."
- "Here is a trusted counsellor/training center."

Product rule:

- Human support should be shown when the user has low confidence, low digital literacy, or a complex path such as government exams.

## Recommendation Logic

The recommendation engine should classify careers into three buckets.

### Eligible Now

The user meets basic education and most required skills.

Output:

- Apply links
- Interview/application checklist
- Documents required
- Short preparation plan

### Reachable Soon

The user has enough foundation but lacks some skills.

Output:

- 30/60/90-day roadmap
- Skill-specific courses
- Practice tasks
- Opportunity watchlist

### Long-Term Path

The career is attractive but requires a longer qualification, exam, or certification.

Output:

- Full roadmap
- Cost/time expectations
- Alternative nearby careers
- Milestones

## What Makes This Useful

The platform should generate a path like:

1. You are 12th pass from Bihar with typing and basic computer skills.
2. You can apply now for data entry and office assistant jobs.
3. SSC CHSL is a good government path, but you need reasoning and quantitative aptitude.
4. Banking correspondent is possible if you improve customer service and digital payments.
5. Start with this 30-day plan:
   - Week 1: typing and computer basics
   - Week 2: Excel and forms
   - Week 3: communication and customer handling
   - Week 4: applications and mock interviews

This is more valuable than:

- A list of jobs
- A generic AI answer
- A generic course list

## Data Quality Rules

Each record should have:

- Source URL
- Source type
- Last fetched date
- Confidence level
- Whether it was manually reviewed
- Whether it is official, partner, public web, or user-submitted

Do not trust:

- Unverified salary claims
- Unofficial government job reposts without official notification link
- YouTube videos selected only by views
- Private job posts without source and date

## MVP Dataset Standard

For every occupation in the MVP, collect:

- Title
- Simple explanation
- Daily tasks
- Minimum education
- Required skills
- Nice-to-have skills
- Salary/stipend range
- Work environment
- Beginner suitability
- Government/private/apprenticeship/self-employment path
- Learning resources
- Real opportunity sources
- 30/60/90-day roadmap

## First High-Value Career Set

Start with careers that are accessible and useful for 10th/12th/ITI users:

- Data Entry Operator
- Customer Support Executive
- Retail Sales Associate
- Warehouse Associate
- Electrician Apprentice
- Solar Technician
- Nursing Assistant
- Banking Correspondent
- SSC CHSL Candidate
- Railway Group D Candidate
- Delivery/Logistics Coordinator
- Beauty and Wellness Assistant
- Tailoring/Apparel Machine Operator
- Mobile Repair Technician
- Computer Hardware Technician

## Build Order

1. Create high-quality occupation pages for 15 careers.
2. Add skill maps and beginner roadmaps.
3. Attach learning resources.
4. Attach official/live opportunity sources.
5. Add recommendation scoring.
6. Add AI only after the data layer can support grounded answers.

## AI Rule

AI should not invent careers, eligibility, salaries, deadlines, or official links.

AI should:

- Explain verified data simply.
- Generate personalized roadmaps from stored career/skill/resource data.
- Translate complex notifications into user-friendly language.
- Ask for missing user profile details when needed.

AI should cite or link the source whenever it makes a factual claim about an opportunity.
