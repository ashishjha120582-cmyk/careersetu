# Initial Data Model

This schema is intentionally platform-neutral. It can later become PostgreSQL tables, Prisma models, Django models, or API contracts.

## users

Stores user profile data.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique user id |
| name | string | Optional for MVP |
| education_level | string | 10th, 12th, ITI, diploma, graduate |
| state | string | User state |
| district | string | Optional |
| skills | string[] | Current skills |
| languages | string[] | Preferred learning languages |
| career_preference | string | private, government, apprenticeship, self_employment, any |

## occupations

Explains careers independent of current vacancies.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique occupation id |
| title | string | Career/job title |
| category | string | Sector/category |
| description | string | Simple explanation |
| daily_tasks | string[] | What the person actually does |
| minimum_education | string | Required education |
| required_skills | string[] | Skill ids or names |
| salary_range | string | Approx range |
| growth_path | string[] | Next roles |
| suitable_for | string[] | User profiles |
| source_refs | string[] | Trusted sources |

## opportunities

Stores live or curated job, exam, apprenticeship, or scheme opportunities.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique opportunity id |
| title | string | Opportunity title |
| type | string | private_job, govt_exam, apprenticeship, scheme |
| organization | string | Company, department, ministry, portal |
| location | string | State/district/remote/all India |
| eligibility | string | Plain eligibility text |
| required_skills | string[] | Skill ids or names |
| last_date | date | Optional |
| salary_or_stipend | string | Optional |
| apply_url | string | Official link |
| source | string | Portal/source name |
| related_occupation_id | string | Link to occupation |

## skills

Stores normalized skills.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique skill id |
| name | string | Skill name |
| category | string | technical, soft, exam, domain |
| difficulty | string | beginner, intermediate, advanced |
| related_occupations | string[] | Occupation ids |

## learning_resources

Stores courses, videos, playlists, and practice resources.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique resource id |
| title | string | Resource title |
| provider | string | SWAYAM, NPTEL, YouTube, etc. |
| type | string | course, video, playlist, article, practice |
| language | string | Hindi, English, regional languages |
| cost | string | free, paid, freemium |
| duration | string | Approx duration |
| skills_taught | string[] | Skill ids or names |
| url | string | Resource link |
| related_occupation_id | string | Optional |

## roadmaps

Stores structured career paths.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique roadmap id |
| occupation_id | string | Linked occupation |
| user_level | string | beginner, some_skills, job_ready |
| estimated_time | string | Example: 3 months |
| steps | object[] | Ordered roadmap steps |

## roadmap step shape

| Field | Type | Notes |
| --- | --- | --- |
| order | number | Step order |
| title | string | Step name |
| description | string | What to do |
| skills | string[] | Skills covered |
| resources | string[] | Resource ids |
| outcome | string | What user achieves |

## Future AI Tables

Later additions:

- user_skill_assessments
- recommendations
- ai_conversations
- retrieved_documents
- source_documents
- ingestion_runs
- data_quality_reports
