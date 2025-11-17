# AI UX Stories – Beyond Chat → Card/Phase Model

These stories translate ideas from Vitaly Friedman's "Beyond Chat: What's Next for AI Design Patterns" into concrete flows for our card + phase architecture.

Each story:

- Describes a scenario in narrative form.
- Shows the sequence of **phases** (`discover`, `shape`, `inspect`, `error`).
- Identifies which **card kinds** appear (`interpret`, `propose`, `mockup`, `lens`, `error`).
- Notes how this maps to our implementation (cards, schema, endpoint, UI).

---

## Story 1 – Less Painful Refinement (Interpret → Propose → Mockup)

**Goal**: Show how a user can go from a fuzzy idea to a structured UI concept without rewriting prompts.

### Scenario

1. **User**: "I want to build a simple app where teams can manage projects and tasks. Can you help me design it?"
2. **System** (assistant) replies with an **Interpret card** clarifying intent:
   - "Are you primarily trying to…"
     - (A) Define the _data model_ (projects, tasks, users, permissions)?
     - (B) Sketch the _main screens_ and navigation structure?
     - (C) Plan the _flows_ (creating tasks, assigning, tracking progress)?
3. **User** clicks "Sketch main screens and navigation".
4. **System** returns a **Propose card**:
   - "Here are 3 possible screen architectures for your app"
     - Option 1: Minimal – projects list + task details overlay.
     - Option 2: Dashboard – overview screen + dedicated project pages.
     - Option 3: Workspace – sidebar navigation with project/task sections.
5. **User** picks Option 2: Dashboard, and the chat inserts a **Selection Summary card** to document the decision inline without synthetic narration. The same decision is reflected in a pinned planning strip that always shows the current intent and architecture choice.
6. **System** responds with a **Mockup** or **Lens** card depending on the selected proposal:
  - “Minimal” now yields a mockup that splits the viewport into toolbar, projects list, and task overlay regions.
  - “Dashboard” returns a lens that enumerates inferred sections (KPIs, grids, calls to action).
  - “Workspace” yields a different mockup that emphasizes the sidebar + canvas split.
  - Each mockup is still rendered as a data-first sketch with layout metaphors (`"shelf"`, `"bookcase"`, `"library"`).

### Phase Sequence

- Initial user message → `phase = "discover"`.
- After user message, `/api/cards` returns `InterpretCard`.
- After interpret selection → `phase = "shape"`; `/api/cards` returns `ProposeCard`.
- After proposal selection → `phase = "inspect"`; `/api/cards` returns `MockupCard`.

### Card Kinds Used

- `interpret` → disambiguate between data model vs. screens vs. flows.
- `selection-summary` → captures the specific interpret/propose option the user committed to so the thread stays readable.
- `propose` → structured alternatives for screen architectures.
- `mockup` → structural layout regions with `layout` metaphors.

### Implementation Notes

- **Card schema**
  - `InterpretCard` and `ProposeCard` options use `minItems: 2`, `maxItems: 5` to keep decisions manageable.
  - `MockupCard.regions` uses `layout: "shelf" | "bookcase" | "library"` to ground design metaphors.

- **Endpoint** (`/api/cards`)
  - For `phase = "discover"`, the system prompt encourages `kind = "interpret"` with the three high-level paths.
  - For `phase = "shape"`, prompt instructs the model to emit `kind = "propose"` with 2–5 structured architectures.
  - For `phase = "inspect"`, prompt nudges toward `kind = "mockup"` with at least one region.

- **UI**
  - `InterpretCard.svelte` / `ProposeCard.svelte` render options as clickable items and fire `onSubmit({ option })` events.
  - `SelectionSummaryCard.svelte` drops inline after each selection to keep a timeline of committed choices.
  - A small pinned planning panel (or strip) mirrors the latest interpret/propose decisions and the current inspect artifact (mockup/lens), so the user always sees the current plan even as the chat scrolls.
  - Mockup card now shows grouped regions via layout bands plus an inline JSON toggle; the same compact representation appears inside the planning panel for mockup artifacts.
  - Lens card renders a structured summary (sections + calls to action) alongside a JSON toggle, and the planning panel mirrors that structure when a lens is pinned.
  - After an interpret option is selected, the client immediately calls `/api/cards` again with `phase = "shape"` to fetch the follow-up `ProposeCard` (Option 3 in `PLAN.md`), and a proposal selection does the same for `phase = "inspect"`.

- **Why this matters (link to Vitaly)**
  - Encodes the _refinement journey_ as a designed flow, not a series of ad-hoc prompts.
  - Moves from raw chat to structured, dynamic interfaces that adapt to the user's intent.

---

## Story 2 – Trust & Transparency (Lens + Error)

**Goal**: Make it easy to understand what the AI "sees" and handle uncertainty gracefully.

### Scenario

1. **User**: "Here’s our current onboarding flow as a list of steps. What’s wrong with it?"
2. **System** returns a **Lens card**:
   - `lensType = "flows"`.
   - `payload` contains:
     - Parsed steps.
     - Detected branching conditions.
     - Potential friction points (e.g., "Long form before users see any value").
3. The lens card renders a clear list/graph of steps and pain points.
4. **User**: "Can you propose 3 improved versions?"
5. **System** attempts to generate proposals but hits a constraint (e.g., missing info about constraints, or model limitation).
6. Instead of failing silently, it returns an **Error card**:
   - `errorKind = "missing_info"`.
   - `details = "I need to know your technical constraints and whether you can add a step for email verification."`
   - `recoveryHint = "Tell me whether you support email verification and SMS, or say 'no extra verification'."`
7. **User** answers with constraints.
8. **System** now returns a **Propose card** with 3 improved flows.

### Phase Sequence

- Initial analysis → `phase = "inspect"` (ask for a lens directly after the user gives concrete data).
- Lens viewing may leave `phase` as `"inspect"`.
- When error arises, transition to `phase = "error"` and emit `ErrorCard`.
- After user supplies missing info, system can either:
  - Return to `phase = "shape"` (to propose options), or
  - Stay in `"inspect"` if we treat this as refining understanding.

### Card Kinds Used

- `lens` → inspect current flows and inferred problems.
- `error` → communicate uncertainty and request missing info.
- `propose` → offer improved versions once constraints are clarified.

### Implementation Notes

- **Card schema**
  - `LensCard.payload` remains open-ended (`unknown` / `{}` in schema) to support varied flow representations.
  - `ErrorCard` enumerates `errorKind` (`"missing_info"`, `"model_uncertain"`, `"invalid_state"`) and includes `recoveryHint`.

- **Endpoint**
  - For questions like "What’s wrong with this flow?", the system prompt can directly favor `kind = "lens"` and set `phase = "inspect"`.
  - On internal model/validation errors, the endpoint synthesizes `ErrorCard` instead of leaking raw exceptions.

- **UI**
  - `LensCard.svelte` initially renders a `<pre>` JSON and can later evolve to a more visual flow map.
  - `ErrorCard.svelte` presents a clear, visually distinct error box with a call to action based on `recoveryHint`.

- **Why this matters (link to Vitaly)**
  - Enacts the talk’s emphasis on **trust** and explainability by making intermediate structure and errors first-class UI objects.
  - Avoids silent failures and cryptic behavior, key to building user confidence.

---

## Story 3 – Quiet vs. Visible AI (Cards Only When It Matters)

**Goal**: Show when to surface explicit cards vs. keep AI assistance in the background.

### Scenario

1. **User** is editing marketing copy in a rich text editor.
2. The system quietly adapts to style over time (quiet AI):
   - Adjusts suggested synonyms to match brand voice.
   - Improves grammar corrections.
3. At a certain point, user explicitly asks: "Can you help me improve this section for conversion?"
4. **System** returns an **Interpret card**:
   - "What should we prioritize?"
     - (A) Clarity.
     - (B) Persuasiveness.
     - (C) Trust-building.
5. User chooses "Trust-building".
6. **System** returns a **Propose card**:
   - "Here are 3 trust-building strategies for this section"
     - Option 1: Social proof.
     - Option 2: Risk reversal.
     - Option 3: Transparent pricing cues.
7. After user chooses, the system quietly updates the copy (quiet AI again) and optionally shows a **Lens card** comparing "before vs after".

### Phase Sequence

- Background assistance: no explicit `phase` change (quiet path).
- When user asks for help explicitly: `phase = "discover"` → `InterpretCard`.
- After selection: `phase = "shape"` → `ProposeCard`.
- After commitment: either remains `"shape"` or moves into `"inspect"` if we show a lens.

### Card Kinds Used

- `interpret` and `propose` for visible decision points.
- Optional `lens` for comparison and transparency.

### Implementation Notes

- **Endpoint**
  - Only called (for cards) when user explicitly invokes help or when the system detects a high-value decision point.
  - Quiet AI happens in-domain tools (editor) without going through `/api/cards`.

- **UI**
  - Cards appear inline in the chat/side panel; once choices are made, the main editing surface updates.
  - Lens card shows diffed copy (future extension).

- **Why this matters (link to Vitaly)**
  - Demonstrates the split between **visible AI** (card interactions) and **quiet AI** (background adaptation), a key theme of the talk.

---

## Story 4 – Different Users, Different Paths (Dynamic Interface Based on Intent)

**Goal**: Show how the same system can adapt flows to novices vs. experts using cards and phases.

### Scenario

1. **Novice user**: "I need help planning a user research study. I’m not sure where to start."
   - System detects uncertainty and sets `phase = "discover"`.
   - Returns an **Interpret card**:
     - "What do you want to focus on first?"
       - (A) Goals & hypotheses.
       - (B) Recruiting participants.
       - (C) Interview script.
   - The rest of the journey follows Story 1 / Story 2 patterns.

2. **Expert user**: "Draft a moderated usability test plan for this checkout flow, focusing on edge cases and error handling."
   - System detects high specificity; may skip `interpret` and go straight to `shape` or `inspect`.
   - Returns a **Propose card** with 2–3 test-plan structures or a **Lens card** outlining entities/flows detected.

### Phase Sequence

- Novice: `discover` → `shape` → `inspect`.
- Expert: can start at `"shape"` or even `"inspect"` directly.

### Card Kinds Used

- `interpret` for novices to clarify intent.
- `propose` / `lens` for experts for rapid exploration.

### Implementation Notes

- **Endpoint**
  - System prompt can include hints like: "If the user’s request is highly specific, you may skip interpret and go directly to propose or lens cards." (while still respecting schema).

- **UI**
  - Same card components; the difference is which ones appear.

- **Why this matters (link to Vitaly)**
  - Illustrates **dynamic interfaces**: the system adapts not just to input content but to user sophistication and context.

---

## Story 5 – Errors as First-Class UX (Error → Recover → Continue)

**Goal**: Make failure states a designed part of the experience, not an afterthought.

### Scenario

1. **User** asks the assistant to generate a complicated flow or schema.
2. **System** calls the model, but the response fails schema validation or times out.
3. Instead of crashing or showing a toast, `/api/cards` synthesizes an **Error card**:
   - `errorKind = "model_uncertain"` or `"invalid_state"`.
   - `details` explain what went wrong in user-friendly terms.
   - `recoveryHint` suggests a specific next step.
4. **User** clicks a "Try again" or "Simplify" button embedded in the error card.
5. System either:
   - Returns to `phase = "discover"` with an **Interpret card** that proposes a narrower scope, or
   - Stays in `"error"` but offers a more constrained `ProposeCard`.

### Phase Sequence

- Normal operation: whatever phase we were in when the error occurred.
- On failure: transition to `phase = "error"` and emit `ErrorCard`.
- On recovery: move to `"discover"` or `"shape"` depending on the chosen action.

### Card Kinds Used

- `error` as the primary card.
- `interpret` or `propose` after recovery.

### Implementation Notes

- **Endpoint**
  - Wraps model calls and validation; on failure, constructs an `ErrorCard` instead of leaking exceptions.

- **UI**
  - `ErrorCard.svelte` includes explicit recovery actions that the chat page handles by adjusting `phase` and re-calling `/api/cards`.

- **Why this matters (link to Vitaly)**
  - Reflects Vitaly’s emphasis on **trust and old-school affordances** even in failure states.
  - Turns errors from dead ends into structured part of the refinement journey.

---

## How to Use These Stories While Building

- As **acceptance slices** for our progressive implementation:
  - Slice 1: Implement Story 1 up to interpret → propose steps with stubbed data.
  - Slice 2: Extend to include mockup and phase transitions.
  - Slice 3+: Add lens, quiet AI interplay, and error handling.

- As **prompting guides**:
  - Use the stories to shape system/assistant prompts in `/api/cards` so the model knows which card kind to produce in each phase.

- As **design references**:
  - Keep these stories close to `PLAN.md` and `AGENTS.md` so changes in domain model, schema, or endpoint behavior can be checked against them: "Does our current behavior still support Story 2?".
