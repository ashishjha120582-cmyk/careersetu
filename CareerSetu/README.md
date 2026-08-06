# CareerSetu Documentation

This folder keeps the working record of what we are building, why we are building it, what has already been done, and what needs to improve next.

Update these files as the product changes.

## Documents

### `BUILD_COMPLETION_PLAN.md`

Use this as the execution checklist:

- What is complete.
- What is partial.
- What is not built.
- Module-by-module completion criteria.
- Recommended sprint order.

### `DEMO_SCRIPT.md`

Use this to test and present the product:

- Demo inputs.
- Expected behavior.
- What is different from normal job search.
- Skill-gap and apply-support story.

### `PRODUCT_WATERFALL.md`

Use this for product thinking:

- Who we help.
- Core user flow.
- What we have built.
- What gaps remain.
- Product modules.
- Data source strategy.
- Local language and voice direction.
- Profile system direction.
- UI principles.
- Product phases.

### `TECHNICAL_ARCHITECTURE.md`

Use this for engineering decisions:

- Current stack.
- Current files.
- Backend endpoints.
- Frontend state.
- Matching/search logic.
- Data model direction.
- Database plan.
- Data ingestion pipeline.
- AI layer.
- Security and privacy.
- Testing checklist.
- Engineering roadmap.

### `DEPLOYMENT.md`

Use this for running the app locally and later deploying it:

- Environment variables.
- OpenRouter key setup.
- Start commands.
- Future hosting shape.

## Documentation Rule

Whenever we make a meaningful change, update at least one of these files:

- Product behavior change: update `PRODUCT_WATERFALL.md`.
- Technical/architecture change: update `TECHNICAL_ARCHITECTURE.md`.
- New major module: update both.

## Current Product Name

CareerSetu

## Current Prototype URL

`http://127.0.0.1:5173/`

## Local Server

Run from project root:

```powershell
npm start
```

Or:

```powershell
node --use-system-ca prototype\server.js
```

For AI, embeddings, and voice transcription, paste the OpenRouter key in project root `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

See `DEPLOYMENT.md` for the full setup.
