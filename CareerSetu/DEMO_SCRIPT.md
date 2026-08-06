# CareerSetu Demo Script

## Demo Goal

Show that CareerSetu is not a normal job search page.

Normal job search asks the user to know job titles, filters, portals, eligibility, and next steps.

CareerSetu lets the user describe themselves naturally, then helps them find suitable jobs, understand fit, learn what is missing, and apply with more confidence.

## Demo Setup

Local URL:

`http://127.0.0.1:5173/`

Start server:

```powershell
node prototype\server.js
```

For full AI demo, start with OpenRouter environment variables set before running the server:

```powershell
$env:OPENROUTER_API_KEY="your-key"
$env:OPENROUTER_CHAT_MODEL="openai/gpt-4o-mini"
$env:OPENROUTER_GUIDE_MODEL="openai/gpt-4o"
$env:OPENROUTER_EMBEDDING_MODEL="openai/text-embedding-3-small"
$env:OPENROUTER_STT_MODEL="openai/gpt-4o-transcribe"
node prototype\server.js
```

## Demo Flow 1: First-Time User

### Input

```text
I am from Rajasthan, 12th pass, know computer and typing. What jobs can I do?
```

### What To Show

- First screen is only chat, heading, and subheading.
- After submitting, the app opens into results.
- Jobs are ranked for location, education, and skills.
- User does not need to know exact job titles.

### Why This Is Different

Normal search needs filters like "data entry", "back office", "computer operator".

CareerSetu understands "know computer and typing" and expands it into related entry-level roles.

## Demo Flow 1B: Voice Search

### Input

Click `Speak`, say in Hindi/Hinglish:

```text
Main Rajasthan se hoon, 12th pass hoon, computer aur typing aati hai
```

### Expected Result

- Voice is transcribed into the chat box.
- The same job search flow runs automatically.
- The user does not need to type English.

### Why This Is Different

For Tier-3 users, voice and local language reduce friction. The product can understand the person first, then normalize the profile internally.

## Demo Flow 2: Degree-Aware Search

### Input A

```text
I am BCom graduate and know Excel. I want a fresher job.
```

### Expected Result

- Accounting, finance, billing, office, Tally/GST-style roles should rank higher.
- Generic 12th-pass roles should not dominate the top.

### Input B

```text
I am 12th pass and know computer.
```

### Expected Result

- Graduate-only jobs should not be shown.
- Flexible 12th-pass roles should appear.

### Why This Is Different

Normal search may show the same jobs for both users.

CareerSetu uses education and degree stream to personalize ranking.

## Demo Flow 3: B.Tech User

### Input

```text
I am BTech fresher and want technical job near me.
```

### Expected Result

- Engineering, technical, technician, trainee, maintenance, quality, site, IT-support, or apprentice-style roles should rank better.

### Why This Is Different

The app does not only match the word "job"; it understands degree stream and likely role families.

## Demo Flow 4: Skill Gap

### Steps

1. Open any job card.
2. Click `Skill guide`.
3. Enter:

```text
I know Excel, typing and basic computer. I am weak in English speaking.
```

### What To Show

- Readiness summary.
- Skills already matched.
- Skills missing.
- What to learn before applying.
- What is usually learned on the job.
- Practical learning steps and YouTube search phrases.
- Interview/practice suggestions.

### Why This Is Different

Normal job search stops after showing a listing.

CareerSetu tells the user how to become ready for that job.

## Demo Flow 5: Saved And Applied

### Steps

1. Save one job.
2. Open `Saved`.
3. Mark a job as applied.
4. Open `Applied`.
5. Generate a voice skill guide from the job detail.

### What To Show

- User can track jobs they liked.
- User can track where they applied.
- User can generate practical learning guidance directly from a job.

### Why This Is Different

Normal search is transactional.

CareerSetu behaves like a job preparation and application assistant.

## Current Demo Caveat

If the OpenRouter key is not set when the server starts:

- Profile extraction uses local fallback.
- Semantic search uses local fallback.
- Skill guide uses local fallback.
- Voice transcription will not work.

This is still useful for UI testing, but the stronger demo needs the server started with the key.

## Best Demo Story

Use three users:

1. **12th pass user**
   - Wants simple computer job.
   - Show flexible entry-level roles.

2. **B.Com user**
   - Wants fresher job.
   - Show accounting/finance/office ranking difference.

3. **Customer support user**
   - Likes talking to people.
   - Show realistic skill guide: speaking, listening, patience, basic computer, mock calls, and on-the-job product learning.

This clearly shows the product value:

- Better discovery.
- Better personalization.
- Better readiness guidance.
- Better apply tracking.
