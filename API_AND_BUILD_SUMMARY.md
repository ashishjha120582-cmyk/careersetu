# API Availability and Build Plan

## Product Goal

The end user should not need to understand job portals, government sites, course platforms, or career taxonomies.

They should answer simple questions:

- What is your education?
- Where are you from?
- What skills do you know?
- What kind of work do you prefer?
- Do you want a job now, exam path, apprenticeship, or self-employment?

Then the system should map them to:

- Public sector opportunities
- Private jobs
- Apprenticeships
- Skill programs
- Learning resources
- Career roadmaps

## API Availability Summary

| Source | Official API available? | Use in product | Notes |
| --- | --- | --- | --- |
| National Career Service | No clearly documented public job-search API found | Public/govt jobs, job fairs, career info, counsellors | Use public pages first; explore partnership/contact later |
| Apprenticeship India / NAPS | No clearly documented public opportunity API found | Apprenticeships | Use portal data carefully; official application links are valuable |
| NATS | No clearly documented public opportunity API found | Graduate/diploma apprenticeships | Treat like NAPS: source-specific ingestion |
| SSC/UPSC/RRB/IBPS/State PSC | Usually no unified API | Govt exam notifications | Scrape notification pages/PDFs and normalize |
| data.gov.in / OGD India | API platform exists | Economic/labour/context indicators | Useful for labour market analytics, not live job matching |
| SWAYAM | Public course catalog exists; no simple stable public API confirmed | Free learning resources | Use catalog scraping/downloads where allowed |
| Skill India Digital Hub | Public portal exists; API not confirmed | Skill courses/training pathways | Explore portal and partner access |
| YouTube Data API | Yes | Day-in-life videos, Hindi/regional learning playlists | Good official API for video discovery |
| O*NET | Yes, API and downloadable database | Occupation tasks, skills, education, work activities | Strong backbone for career understanding |
| ESCO | Yes, downloadable dataset and services | Skill/occupation taxonomy | Good for normalizing skills |
| LinkedIn | Official APIs exist but Talent APIs are partner/restricted | Private jobs | For MVP use Apify/JobSpy cautiously; official access later if partner |
| Indeed | Hiring-side APIs exist; job-search API is not generally available | Private jobs | Apify notes old Publisher Jobs API was deprecated |
| Naukri | No public job-search API confirmed | India private jobs | Use JobSpy/Apify or direct partnerships |
| Google Jobs | No general public job-search API | Discovery signal | Google provides JobPosting structured-data guidance for publishers, not an open search API |

## Practical Conclusion

There is no single clean API that gives all Indian public and private opportunities.

The product must use a hybrid ingestion system:

1. Official/public sources for government jobs, apprenticeships, courses, and career info.
2. Job scraping APIs/wrappers for private market data.
3. Downloadable occupation/skill taxonomies for career understanding.
4. AI only after the data is normalized and source-linked.

## Recommended MVP Data Strategy

### Phase 1: Curated + Reliable

Build high-quality records manually for 15-30 careers:

- Career explanation
- Daily work
- Required skills
- Eligibility
- Salary range
- Skill gap map
- 30/60/90-day roadmap
- Learning resources
- Official application/source links

This gives a usable product before scraping becomes complicated.

### Phase 2: Private Job Aggregation

Use one of these:

- JobSpy for low-cost development experiments
- Apify actors for more reliable hosted scraping
- Later: direct partnerships with job boards or employers

Recommended first private sources:

- Indeed
- LinkedIn
- Naukri if JobSpy/Apify coverage is acceptable
- Google Jobs via JobSpy only as a discovery layer
- Apna/WorkIndia later, because they are highly relevant for local jobs

### Phase 3: Public Opportunity Ingestion

Build source-specific ingestors:

- SSC notifications
- RRB notifications
- IBPS notifications
- UPSC notifications
- State PSC notifications
- NAPS/NATS apprenticeship listings
- NCS job fairs and public job search pages

Government data will often be HTML pages or PDFs, not APIs.

### Phase 4: Upskilling and Roadmaps

Attach learning resources from:

- SWAYAM
- NPTEL
- Skill India
- YouTube Data API
- State skill portals

Every resource must map to a missing skill.

## How the System Should Work

### User Input

Keep setup very easy:

- Education level
- State/district
- Known skills
- Languages
- Interest style:
  - computer/office
  - field work
  - customer work
  - government exam
  - technical hands-on
  - healthcare
  - logistics
  - business/self-employment
- Urgency:
  - job now
  - ready in 1 month
  - ready in 3 months
  - ready in 6+ months

### Matching Pipeline

1. Convert user input into structured profile.
2. Match against occupation database.
3. Match against live public/private opportunities.
4. Score each path:
   - education fit
   - skill fit
   - location fit
   - language fit
   - time-to-employability
   - trust/source quality
5. Put results into buckets:
   - Apply now
   - Learn then apply
   - Prepare for exam
   - Apprenticeship path
   - Self-employment path

### Output to User

For each recommended path:

- Why this matches you
- What this job actually does
- What you already know
- What you must learn
- How long it will take
- Free learning resources
- Current opportunities
- Official/apply links
- Documents needed
- Next 3 actions

## System Architecture

### Frontend

- Simple mobile-first web app
- Profile wizard
- Recommendation dashboard
- Career detail page
- Roadmap page
- Saved opportunities

### Backend

Recommended:

- FastAPI or Node.js API
- PostgreSQL database
- Background workers for ingestion
- Object storage for raw PDFs/HTML snapshots

### Data Services

Tables/modules:

- users
- occupations
- skills
- opportunities
- learning_resources
- roadmaps
- ingestion_runs
- source_documents
- recommendations

### AI Layer

Use AI for:

- Explaining jobs simply
- Extracting skills from job descriptions
- Parsing government PDFs into structured fields
- Generating personalized roadmap text
- Translating to Hindi/regional language

Do not use AI as the source of truth.

## Scraping/API Choices

### JobSpy

Good for:

- Development experiments
- Multi-board job aggregation
- Python pipeline
- Lower cost

Concerns:

- Blocking/rate limits
- Source fragility
- Compliance review needed before production

### Apify

Good for:

- Hosted scrapers
- More reliable operations than custom scripts
- Exports to JSON/CSV
- Existing actors for LinkedIn and Indeed

Concerns:

- Paid usage
- Actor quality varies
- Still needs compliance review

### Custom Scrapers

Good for:

- Government notifications
- Static public pages
- PDFs
- Portals with predictable structures

Concerns:

- Maintenance
- Must respect source policies

## First Build Recommendation

Do not start with all sources.

Build this first:

1. Profile wizard
2. Occupation and skill database for 20 careers
3. Recommendation engine using curated data
4. Roadmap generator from stored steps
5. One private job ingestion source using JobSpy or Apify
6. One government notification ingestor, such as SSC
7. One learning-resource ingestor, such as YouTube Data API or curated SWAYAM/NPTEL records

This proves the full loop:

Profile -> Matching -> Skill gap -> Roadmap -> Current opportunity -> Apply

## Source Verification Notes

- O*NET has official web services and downloadable database files.
- ESCO provides downloadable skill/occupation data.
- YouTube Data API supports search over videos/playlists/channels.
- Apify has actors for LinkedIn Jobs and Indeed Jobs.
- JobSpy supports LinkedIn, Indeed, Google, ZipRecruiter, Glassdoor, Bayt, Bdjobs, and includes Naukri-specific fields in its schema.
- NCS exposes useful public pages for jobs, government job links, career information, job fairs, counsellors, and career centers, but I did not find a clearly documented open job-search API.
- For private job boards, official APIs are usually restricted, deprecated, or focused on employers rather than public job search.
