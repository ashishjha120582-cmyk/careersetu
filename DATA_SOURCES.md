# Data Sources and Ingestion Plan

## Principle

Use official and stable sources wherever possible. Use scraping only for public information and only when an API or official download is unavailable.

## Source Priority

1. Official government data
2. Official recruitment portals
3. Public apprenticeship and training portals
4. Private job APIs/wrappers
5. Curated learning resources
6. Public web extraction for missing fields

## Opportunity Sources

| Source | Data | Method | MVP Priority |
| --- | --- | --- | --- |
| National Career Service | Jobs, job fairs, career info | API/scrape/public pages | High |
| SSC | Exams, notifications, eligibility | Scrape notifications/PDFs | High |
| UPSC | Exams, notifications | Scrape notifications/PDFs | Medium |
| RRB portals | Railway jobs | Scrape notifications/PDFs | High |
| IBPS | Banking exams | Scrape notifications/PDFs | Medium |
| State PSCs | State govt exams | Scrape notifications/PDFs | Medium |
| NAPS | Apprenticeships | API/scrape | High |
| NATS | Apprenticeships | API/scrape | High |
| Naukri/Indeed/LinkedIn/Foundit | Private jobs | API/wrapper such as Apify or JobSpy | Medium |
| Apna/WorkIndia | Local jobs | API/scrape/public pages | Medium |

## Learning Sources

| Source | Data | Method | MVP Priority |
| --- | --- | --- | --- |
| SWAYAM | Courses | Public catalog/API if available | High |
| NPTEL | Courses | Public catalog scrape | High |
| Skill India/PMKVY | Training programs | Public pages/downloads | High |
| YouTube | Intro videos/playlists | YouTube Data API | High |
| Coursera/edX | Courses | Public catalogs/APIs | Low |

## Knowledge Sources

| Source | Data | Method | MVP Priority |
| --- | --- | --- | --- |
| National Classification of Occupations | Occupation taxonomy | Official downloads/PDFs | High |
| O*NET | Tasks, skills, knowledge | Official database files/API | High |
| ESCO | Skills and occupations | Official dataset/API | Medium |

## Suggested Ingestion Pipeline

1. Fetch
   Download pages, APIs, PDFs, or dataset files.

2. Parse
   Convert raw HTML/PDF/CSV/API responses into structured records.

3. Normalize
   Map fields to common schema: title, eligibility, skills, location, source, apply URL.

4. Enrich
   Attach occupation, skills, roadmap, and learning resources.

5. Validate
   Check required fields, dates, duplicate records, and source URL.

6. Store
   Save in database or JSON during MVP.

7. Recommend
   Match user profile to opportunities and roadmaps.

## Scraper Rules

- Prefer official APIs and downloads.
- Respect robots.txt and site terms.
- Do not bypass authentication or paywalls.
- Store source URL and fetched timestamp.
- Keep scrapers small and source-specific.
- Parse PDFs into structured notifications where needed.

## MVP Approach

For the first demo:

- Use curated JSON seed data.
- Simulate recommendation logic locally.
- Add real ingestion one source at a time.

First ingestion targets:

1. SSC notification index
2. Apprenticeship India/NAPS opportunities
3. SWAYAM/NPTEL course catalogs
4. NCS public job listings
