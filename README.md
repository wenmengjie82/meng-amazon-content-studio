# Meng Amazon Content Studio

A workflow workbench for Amazon content planning, designed for teams that already use structured product briefs, evidence gates, and AI planning skills.

This is the planning-side companion to Strategy-Pack Image Studio.

## What this app is

Meng Amazon Content Studio turns a filled or draft Amazon Brief into a controlled content-planning workflow:

1. Import / load an Amazon Brief.
2. Review product facts and visual truth locks.
3. Manage claim evidence boundaries.
4. Move through planning stages.
5. Draft Listing, image content plan, Premium A+, and Brand Story outputs.
6. Run QA gates.
7. Export a planning delivery package.

## What this app is not

- Not an image generator.
- Not an image prompt generator.
- Not a replacement for claim evidence review.
- Not a listing-bullets-only tool.
- Not a final legal/compliance approval system.

## Workflow logic

The app is based on this workflow:

```text
Amazon Brief
→ Intake
→ Product Fact Extraction
→ Product Truth Lock
→ Claim Evidence Control
→ Competitor / VOC Understanding
→ Positioning & Selling Point Architecture
→ Image Content Plan / Listing / Premium A+ / Brand Story
→ QA
→ Delivery Package
```

## Brief sections supported

The sample brief follows Amazon-Brief-v1.0 and includes:

- Metadata
- Product facts
- Visual truth locks
- Functional claims
- User profile
- Pain points
- Selling point priority matrix
- Competitor / differentiation
- Keywords
- Brand background
- Constraints and forbidden claims
- Materials checklist

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## MVP behavior

This MVP uses browser state and sample JSON only. It does not call AI APIs yet.

AI execution can be added later through API routes that call Codex / OpenAI / Claude / internal agents.

## Acceptance criteria

The MVP passes if:

1. User can load the sample Amazon Brief planning pack.
2. User can see workflow stages and gates.
3. User can edit brief fields.
4. User can inspect truth locks and claim boundaries.
5. User can draft planning outputs.
6. User can run QA status labels: `pass`, `needs_revision`, `fail`, `blocked`.
7. User can export a Markdown delivery package.
8. The system never marks unverified content as final.
