# Collabassist – Card‑First AI UX Playground

Collabassist is an experimental SvelteKit app for exploring **card‑based AI interaction patterns**.

Instead of treating AI as "a text box with a brain behind it", this project treats **structured cards** and **artifacts** as the primary way people collaborate with an assistant. It’s a place to prototype and refine patterns like disambiguation, proposals, lenses, and mockups – all grounded in a typed model and JSON Schema.

The goal is to make it easy to test ideas like those in Vitaly Friedman’s _Beyond Chat: What’s Next for AI Design Patterns_ talk in real, running code.

---

## Vision

We want a world where:

- Building an AI‑powered feature feels like composing **clear interaction moves** (cards, flows, artifacts), not wrestling with prompt strings and ad‑hoc JSON blobs.
- Assistants don’t just dump paragraphs into a chat window; they emit **well‑structured cards** that:
  - clarify ambiguous intent (interpret),
  - offer alternative paths (propose),
  - sketch structural layouts (mockup),
  - reveal underlying models and flows (lens), and
  - fail gracefully with recovery paths (error).
- Designers and developers collaborate on a shared, **typed language** of AI UX patterns that can be:
  - expressed in TypeScript,
  - constrained with JSON Schema (e.g. `response_format: json_schema`), and
  - rendered with small Svelte components.
- AI is often **AI‑second, not AI‑first**: we start from the product’s flows and artifacts, then invite AI in where it makes the collaboration better.
- Locked‑in interpretations and structural decisions graduate from the scrolling thread into **pinned artifacts**, so the refinement journey always has a stable planning surface.
- Inspect artifacts stay **data-first sketches**: mockups and lenses are rendered visually, but always feel like structural diagrams backed by JSON the user (or model) can inspect.

If this vision works, an AI feature isn’t "we added a chat tab" – it’s "we designed a set of cards and flows that make hard things feel approachable".

---

## Values

These values are meant to be decision filters, especially when the plan doesn’t specify a detail.

### 1. Card‑first over prompt soup

- We prefer **explicit card types** (`interpret`, `propose`, `mockup`, `lens`, `error`) over implicit conventions inside free‑form text.
- If a pattern matters to the UX, it should exist as a **first‑class card** with a type, schema, and component – not just prose.

### 2. Schema‑first over ad‑hoc JSON

- AI outputs are constrained via **JSON Schema**, not wishful thinking.
- The TypeScript `AnyCard` union and `card.schema.json` must stay in sync.
- When we add a new interaction pattern, we:
  1.  define/extend the TS type,
  2.  update the JSON Schema,
  3.  update the AI prompt / tools to use it,
  4.  add or extend a Svelte component.

### 3. Progressive slices over big‑bang features

- We design and build **thin, end‑to‑end slices** (MVP pyramid) that are usable and demoable, then sharpen them.
- We avoid building large layers of plumbing with no visible UX.
- Every slice should:
  - accept a real user input,
  - call a real endpoint,
  - return a concrete card,
  - render it in the chat UI,
  - and respond to at least one user action.

### 4. AI‑second over AI‑first

- We start from the **product’s flows and artifacts** and then decide where AI should appear.
- Some AI is **visible** (cards, explanations, lenses); some is **quiet** (better defaults, background analysis). We choose intentionally.

### 5. Baseline web + Svelte over heavy stacks

- We lean on **Svelte 5**, Skeleton (as configured in this repo's Tailwind 4 + `@theme` setup), Bits UI, native `<dialog>`, and Baseline web features.
- We avoid importing entire component libraries or dialog frameworks when native elements and small components will do.
- Layout and styling live in Svelte components, not giant global CSS blobs. See `docs/ui/style-guide.md` for the markup + scoped CSS conventions we follow day to day.

### 6. Shared language over one‑off hacks

- `AGENTS.md`, `PLAN.md`, the card schema, and the stories under `docs/ai/` are part of the product: they encode our shared language for AI UX.
- When we learn something new, we update these docs so future slices can benefit.

---

## What’s in Here Today

- A basic **chat shell** (`ChatShell`, `ChatThread`, `ChatComposer`).
- A **message model** (`src/lib/domain/message.ts`) with text and card messages.
- A **card model** (`src/lib/cards/types.ts`) and matching **JSON Schema** (`src/lib/schema/card.schema.json`).
- A **card registry** (`src/lib/ui/card-registry.ts`) and the first card components (`Interpret`, `Propose`, `Lens`, `Mockup`, `Error`, and `SelectionSummary` that records user picks inline).
- A **pinned planning panel** (`PlanningPanel.svelte` backed by `planning-store.ts`) that mirrors the locked interpret/propose decisions and the latest inspect artifact so the plan stays visible even as the chat scrolls.
- A stubbed `/api/cards` endpoint that already branches by `phase` (`discover` → interpret, `shape` → propose, `inspect` → lens/mockup) so interpret and propose selections trigger automatic follow-up calls.
- A recursive, quantum-aware mockup layout spec in `docs/ai/mockup-layout-spec.md` implemented by `MockupRegions.svelte`, used consistently in both cards and the planning panel.
- Design notes and story flows in `docs/ai/` that stay in lockstep with the implementation.

The next major steps are:

- Replace the stubbed cards with real model-generated cards using `response_format: json_schema`, while keeping the same card/phase UX contract.
- Fill out the inspect stage with richer mockup cards and artifact hooks, plus add `ErrorCard` + recovery actions before moving on to Slice 4.

---

## Quick Start

Install dependencies:

```sh
pnpm install
```

Run the dev server:

```sh
pnpm dev
```

Then open the app (by default at `http://localhost:5173/`) and try sending a message on the main page. As we implement the card pipeline, this will evolve from a simple echo chat into the card‑driven AI UX described above.

---

## Contributing to the Card/Phase MVP

For how we’re structuring the MVP slices and the "progressive JPEG" working agreement, see `PLAN.md`. That file describes the end‑to‑end slices we’re building (interpret → propose → mockup/lens → error) and how each slice should work before we move on.
