# AI Card UX – Working Plan (Progressive JPEG)

This plan turns the canvas notes into a living roadmap for building a JSON-schema-driven card system and wiring it into the existing SvelteKit chat UX. It is intentionally high-level and will be refined as we go.

---

## 1. Big-Picture Goals (Aligned with Vision & Values)

This plan operationalizes the README vision and values in terms of concrete slices.

- **Card-first AI UX**: structured cards (`interpret`, `propose`, `mockup`, `lens`, `error`) are the primary assistant outputs.
- **Schema-driven AI output**: use JSON Schema + `response_format: json_schema` as the contract between model and UI.
- **Typed, composable domain model**: a single `AnyCard` union and message model shared across server, tools, and UI.
  - Locked-in interpretations and structural decisions become **pinned artifacts**, so the refinement journey always has a stable planning surface instead of living only in the scrolling thread.
- **Svelte-native card rendering**: render cards via a registry + focused Svelte components, not hard-coded conditionals everywhere.
- **Phase-aware orchestration**: a small phase machine (`discover` → `shape` → `inspect` → `error`) that describes the refinement journey.
- **Provider-agnostic runtime**: AI runtime isolated behind a `/api/cards` endpoint using Vercel AI SDK (or equivalent).

---

## 2. Working Agreement & Process ("Progressive JPEG")

This plan is our V2MOM-style agreement for how we build:

- We work in **slices**, not layers.
- Every slice must be **end-to-end demoable** before we move on.
- We continuously align slices with:
  - the **vision and values** in `README.md`, and
  - the **stories** in `docs/ai/ai-ux-stories.md`.

Concretely:

1. When adding or changing behavior:
   - Ask: _which slice does this belong to?_ If it’s not part of an existing slice, either add a new slice or defer it.
   - Avoid starting more than one new slice at a time.

2. When making design trade-offs:
   - Prefer card-first, schema-first solutions over one-off prompt hacks.
   - Prefer visible, inspectable cards for major decisions; use quiet AI sparingly and intentionally.

3. When learning something new:
   - Update `README.md` (vision/values) only when our directional beliefs change.
   - Update `PLAN.md` when slices or working norms change.
   - Update `docs/ai/*.md` when we refine stories or patterns.

4. At natural **phase boundaries** (e.g. when an MVP slice is "done enough" or after a significant design insight), run a **coherence pass**:

- Treat the trigger phrase _"Phase boundary – run coherence pass"_ (or "Let's do a coherence pass") as a request to:
  - Check that `README.md` (Vision & Values), `PLAN.md` (slices & agreement), and `docs/ai/ai-ux-stories.md` (stories) still describe the same world.
  - Adjust whichever of the three is now out of sync so the high-level and the details match again.
  - Discuss any significant changes with Yehuda if it's not obvious how to make the docs and implementation coherent.

This file is meant to evolve as we learn; treat it as the living bridge between a vivid vision in the README and concrete slices in the codebase.

---

## 3. Broad Outline of Work (by Layer)

This section describes the major pieces; the next section slices them into end-to-end MVPs.

### 3.1 Domain & Schema Layer

1. **Card model (done / refine as needed)**
   - Keep `CardKind`, `CardBase`, and concrete card interfaces (`InterpretCard`, `ProposeCard`, `MockupCard`, `LensCard`, `ErrorCard`, `AnyCard`) in `src/lib/cards/types.ts`.
   - Add small helpers (type guards, factories) only when they sharpen ergonomics.

2. **JSON Schema for cards (done / refine as needed)**
   - Maintain `src/lib/schema/card.schema.json` as the single source of truth for the JSON shape.
   - Ensure it mirrors the TS model, with useful constraints:
     - `interpret.options` / `propose.options`: 2–5 items.
     - `mockup.regions`: ≥ 1, with `layout` enum.
     - `lensType`, `errorKind`: explicit enums.
   - (Optional) Add a tiny TS helper (e.g. `src/lib/schema/index.ts`) to import and expose the schema, plus an optional dev-time validator.

3. **Message model alignment**
   - Keep core message types in `src/lib/domain/message.ts` (`Message`, `CardMessage`, etc.).
   - Introduce a new `cardType`/`spec` mapping for AI cards (e.g. `cardType: 'ai-card'`, `spec: AnyCard`) or a dedicated `ai-card` kind if that proves clearer.
   - Avoid baking UI concerns into the domain types.

### 3.2 AI Runtime & Endpoint

4. **Cards endpoint** – `src/routes/api/cards/+server.ts`
   - Accept `POST` body with:
     - `messages: { role; content }[]` (compact history for the LLM).
     - `phase: 'discover' | 'shape' | 'inspect' | 'error'`.
   - Use Vercel AI SDK to call the model with:
     - A system prompt describing card roles and the current phase.
     - `response_format: { type: 'json_schema', json_schema: { name: 'Card', schema, strict: true } }`.
   - Parse and return a single `AnyCard` as JSON.
   - Add minimal error handling:
     - If the call fails or the payload is invalid, synthesize an `ErrorCard` (e.g. `errorKind: 'model_uncertain' | 'invalid_state'`).
     - Optionally log diagnostics on the server side.

5. **(Optional) Dev-time validation**
   - Gate a JSON Schema validator behind `DEV` (e.g. `ajv` or `typebox`) to assert that the returned card conforms to `card.schema.json`.
   - Fail closed in dev (throw) and fail open in production (wrap as `ErrorCard`).

### 3.3 Card Components & Registry

6. **CardShell** – shared frame
   - Create `src/lib/cards/CardShell.svelte` as a simple visual wrapper (title, description, subtle border) that all card components can use.

7. **Per-kind card components** – in `src/lib/cards/`
   - `InterpretCard.svelte`
     - Receives `InterpretCard`.
     - Renders options as buttons or radio-style items.
     - Emits `onSelect({ optionId | option })`.
   - `ProposeCard.svelte`
     - Similar structure to InterpretCard, semantics are "choose a path".
     - Emits `onChoose({ optionId | option })`.
   - `MockupCard.svelte`
     - Shows regions grouped or tagged by `layout` (shelf/bookcase/library).
     - For now, static text; later, this can evolve into draggable/layout-aware UI.
   - `LensCard.svelte`
     - Shows `lensType` and a `<pre>` JSON view of `payload`.
   - `ErrorCard.svelte`
     - Shows `errorKind`, `details`, and `recoveryHint` if present.

8. **Card registry wiring** – `src/lib/ui/card-registry.ts`
   - Register card types → Svelte components.
   - Decide how these AI cards coexist with the existing `choice` card (e.g. `cardType: 'ai-card:interpret'` vs. a separate `kind`).
   - Keep the registry minimal and extendable.

### 3.4 Chat Page Integration & Phase Orchestration

9. **Phase model**
   - Define `type Phase = 'discover' | 'shape' | 'inspect' | 'error';` in a small module (e.g. `src/lib/domain/phase.ts`).
   - In `src/routes/+page.svelte` (or a dedicated chat route), add `let phase: Phase = 'discover';`.

10. **Wire `/api/cards` into the chat flow**
    - On user send:
      - Append a `user` text message to the local `messages` array.
      - Call `/api/cards` with a compact representation of the conversation and current `phase`.
      - When the card comes back, append an assistant `CardMessage` carrying the `AnyCard` payload.
    - On card interaction (Interpret/Propose):
      - Log the user’s choice as a new `user` message.
      - Update `phase` (see 11).
      - Call `/api/cards` again with updated `messages` and `phase`.

11. **Phase transitions (simple state machine)**
    - Initial: after the first user message → `phase = 'discover'`.
    - If the assistant returns an `InterpretCard` and the user selects an option:
      - Log the choice and transition `phase` to `'shape'`.
    - If the assistant returns a `ProposeCard` and the user selects an option:
      - Log the choice and transition `phase` to `'inspect'`.
    - If the assistant returns a `MockupCard` or `LensCard`:
      - Stay in `'inspect'` by default, with the option to re-enter `'shape'`/`'discover'` based on future UX decisions.
    - If anything goes wrong (API error, invalid card, user clicks "something’s off"):
      - Transition `phase` to `'error'` and request an `ErrorCard`.

12. **MessageView wiring** – `src/lib/ui/MessageView.svelte`
    - Extend the card rendering branch so that when it sees an AI card `cardType`, it dispatches to the appropriate card component from the registry.
    - Ensure `onCardSubmit` / `onSelect` / `onChoose` events are propagated back to the chat page so it can update messages and `phase`.

---

## 4. MVP Slices (MVP Pyramid / Progressive JPEG)

Instead of building layer by layer, we build **thin, end-to-end slices**. Each slice should be demoable: a user can type something, the system calls an endpoint, returns a card, renders it, and responds to at least one interaction.

Each slice can be refined over time, but we avoid leaving half-wired plumbing with no visible UX.

### Slice 1 – "Hello, Interpret" (Baseline Card Flow)

**Goal**: From a user message to a single `InterpretCard` rendered in the chat, with a working button click that logs the choice.

- **Scope**
  - Use existing card TS model and schema (no changes required).
  - Add a minimal schema helper module (e.g. `src/lib/schema/index.ts`) that re-exports `card.schema.json`.
  - Implement `/api/cards/+server.ts` to return a **hard-coded** but schema-conforming `InterpretCard` (no real model yet).
  - Add `CardShell.svelte` and `InterpretCard.svelte` with minimal styling.
  - Register `interpret` in `card-registry.ts` (or an `ai-card:interpret` `cardType` that wraps `InterpretCard`).
  - Update `+page.svelte` so that:
    - On user send, we append a user message **and** call `/api/cards`.
    - When the card JSON returns, we wrap it as a `CardMessage` and push it into `messages`.
    - Clicking an interpret option posts back via `onCardSubmit` and logs a user text message describing the choice.

- **Status (current)**
  - `CardShell`, `InterpretCard`, the card registry mapping, and a stubbed `/api/cards` endpoint are implemented.
  - The main chat page calls `/api/cards`, renders the returned interpret card, and now turns an interpret click into both a **SelectionSummaryCard** (recording the choice inline) and an automatic follow-up `/api/cards` request.
  - This slice is effectively complete; further refinements now live in Slice 2 and beyond.

- **Phase behavior**
  - Introduce `Phase` type (`discover | shape | inspect | error`) and a `let phase: Phase = 'discover';` in `+page.svelte`.
  - For Slice 1, we can keep phase static (`'discover'`) and simply pass it into `/api/cards`.

- **"Done" when**
  - Typing a message shows a hard-coded `interpret` card in the chat.
  - Clicking an option logs the choice as a user message.
  - No real AI call is required yet.

### Slice 2 – "Interpret → Propose" (Refinement Journey Core)

**Goal**: Implement the first half of the refinement journey: clarify intent, then propose 2–5 paths.

- **Scope**
  - Add `ProposeCard.svelte` and register it in `card-registry.ts`.
  - Extend `/api/cards/+server.ts` to:
    - Accept `phase` and `messages`.
    - When `phase = 'discover'`, emit an `InterpretCard` (stubbed or model-generated).
    - When `phase = 'shape'`, emit a `ProposeCard` (stubbed or model-generated).
  - Implement simple phase transitions in the chat page:
    - After user sends their **first** message, set `phase = 'discover'`.
    - After user picks an interpret option, log the choice, append a `SelectionSummaryCard`, set `phase = 'shape'`, then call `/api/cards` again.
  - Optionally start wiring Vercel AI SDK, but it’s acceptable if the cards are still stubbed as long as the flow is correct.

- **Status (current)**
  - `ProposeCard` is implemented, the endpoint returns it whenever `phase = 'shape'`, and the chat flow automatically fetches it after an interpret click.
  - Selection summaries keep the thread readable without synthetic prose.
  - Next step is to wire the proposal selection into the inspect phase (Slice 3) and broaden the inspect payloads beyond the current lens stub.

- **"Done" when**
  - User types a message.
  - System shows `InterpretCard` → user selects an option → system shows `ProposeCard`.
  - Both cards render via the shared `CardShell` and card registry, with selection summaries capturing each decision.

### Slice 3 – "Inspect" (Lens / Mockup)

**Goal**: Add the ability to inspect or visualize structure (lens/mockup), completing the core refinement loop from the stories doc.

- **Scope**
  - Implement `LensCard.svelte` and `MockupCard.svelte` with simple visuals:
    - Lens: `lensType` label and a `<pre>` of `payload`.
    - Mockup: list of `regions` grouped or annotated by `layout`.
  - Register `lens` and `mockup` in `card-registry.ts`.
  - Extend `/api/cards` to:
    - When `phase = 'inspect'`, emit a `LensCard` or `MockupCard` depending on the last choice or prompt instructions.
  - Add phase transitions:
    - After user picks a proposal in `ProposeCard`, append another `SelectionSummaryCard`, set `phase = 'inspect'`, and call `/api/cards`.
    - Stay in `inspect` by default for subsequent inspect-related interactions.
  - Introduce a small **pinned planning panel** (or strip) that mirrors the current locked-in interpretation, chosen proposal, and latest inspect artifact (lens/mockup), backed by the same artifact/domain model rather than ad-hoc UI state.
  - Design the mockup experience as a **data-oriented sketch**: each region renders as an abstract layout block, with a “View JSON” affordance so advanced users can inspect the source structure without leaving the thread.

- **Status (current)**
  - `LensCard` is wired through the registry, and the endpoint returns lens cards for `phase = 'inspect'`.
  - Proposal selections already trigger the `inspect` follow-up, and the pinned `PlanningPanel.svelte` now mirrors the interpret/propose picks plus the current inspect artifact.
  - Choosing the “minimal” and “workspace” paths now returns distinct mockup sketches, while “dashboard” yields a lens; all inspect artifacts show inline JSON toggles and the planning panel mirrors the active artifact (mockup regions or lens summary) using the same presenter components.
  - **Next up**: diversify inspect payloads for any new proposal branches, and wire the same presenters into future artifact side panels so mockups/lenses stay consistent when they graduate beyond the thread.

- **"Done" when**
  - User can experience the full loop from **Story 1** in `docs/ai/ai-ux-stories.md`:
    - initial message → interpret → propose → mockup or lens.

### Slice 4 – "Real Model, Same Flow" (Response Format + Vercel AI SDK)

**Goal**: Replace stubbed cards with real model-generated cards using `response_format: json_schema`, without changing the UX contract.

- **Scope**
  - Add Vercel AI SDK and configure it to call a model (e.g. `gpt-5.1`) with:
    - System prompt that describes card kinds and phases.
    - `response_format: { type: 'json_schema', json_schema: { name: 'Card', schema, strict: true } }`.
  - Update `/api/cards` so that for each phase it:
    - Constructs the appropriate prompt (using examples from `docs/ai/ai-ux-stories.md`).
    - Validates the response shape, and casts to `AnyCard`.
  - Optionally add a dev-only JSON Schema validator that throws on invalid cards.

- **"Done" when**
  - The same flows from Slices 1–3 work, but cards are generated by the model.
  - If the model misbehaves (bad schema), we see clear errors in dev.

### Slice 5 – "Error & Recovery" (ErrorCard + Robustness)

**Goal**: Make errors and uncertainty first-class UX patterns instead of edge cases.

- **Scope**
  - Implement `ErrorCard.svelte` and register `error` in `card-registry.ts`.
  - Extend `/api/cards` error handling:
    - On network/model/validation errors, synthesize an `ErrorCard` with `errorKind` and `recoveryHint`.
  - Add UI-level recovery actions:
    - Buttons like "Try again" or "Narrow the question" on the error card.
    - Handler in `+page.svelte` that adjusts `phase` (e.g. back to `discover`) and triggers another `/api/cards` call.

- **"Done" when**
  - Any failure during Slices 2–4 yields a visible `ErrorCard`, not a console error.
  - Users can recover by following the actions on the error card.

### Slice 6+ – Iterative Refinement

**Goal**: Iterate on prompts, card specs, and artifact integration based on usage.

- **Scope** (examples, not exhaustive)
  - Refine prompts and phase logic per story in `docs/ai/ai-ux-stories.md`.
  - Add new card kinds for artifact editing or command execution.
  - Integrate artifact side panels and tabs using card-triggered actions.
  - Improve styling and motion (Skeleton, Bits UI, native dialogs).

- **"Done" when**
  - We can support several of the stories in `ai-ux-stories.md` convincingly, and changes to patterns are reflected in:
    - types,
    - schema,
    - prompts,
    - and components.
