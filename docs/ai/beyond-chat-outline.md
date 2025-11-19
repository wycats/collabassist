# Vitaly Friedman – "Beyond Chat: What's Next for AI Design Patterns" (Working Outline)

> Source: Dive Club episode / YouTube video `C19H4QimihM` – this is a reconstructed, design-focused outline based on public metadata, chapter titles, and common themes in Vitaly’s work. It is intended as a _working design reference_, not a verbatim transcript.

---

## 0. Framing & Intro (0:00–1:03)

- **Who**
  - Vitaly Friedman – co-founder of Smashing Magazine, UX practitioner focusing on complex interfaces and AI design.
  - Interview format (Dive Club podcast/video) with a host driving questions.

- **What**
  - Topic: _Beyond chat windows_. How AI reshapes patterns and processes, and what new design patterns we need.

- **Why**
  - Most AI products default to "chat plus a big text box".
  - This is often insufficient for:
    - Complex tasks.
    - Trust and explainability.
    - Helping users refine and steer.
  - We need richer interaction building blocks.

---

## 1. State of AI Design Today (1:03–6:47)

- **Common pattern: "Chat slapped on the side"**
  - Many tools just add an AI icon and a chat panel.
  - Users are left guessing:
    - "What can this thing do?"
    - "How should I ask?"
    - "What happens if I'm wrong?"

- **Problems with the chat-only pattern**
  - Long, unstructured answers ("walls of text").
  - Hard to refine: users retype or tweak prompts instead of working with structured levers.
  - Low sense of control and predictability.
  - Difficult to connect AI output to the rest of the product (artifacts, data, flows).

- **Key insight**
  - AI UX should be _designed_, not just prompted.
  - Chat is one channel, but we need patterns and components around it.

- **Alignment with this repo**
  - Our **card model** (`interpret`, `propose`, `mockup`, `lens`, `error`) is a deliberate move away from raw chat-only responses.
  - JSON-schema-driven **AnyCard** formalizes these as first-class patterns instead of ad-hoc messages.

---

## 2. Example Design Patterns for Interacting with AI (6:47–24:27)

> How can we move from generic chat to _structured interactions_?

- **2.1 Disambiguation / Intent Clarification**
  - Pattern: When a request is ambiguous, AI offers 2–5 interpretations instead of guessing.
  - Benefits:
    - Reduces misunderstanding early.
    - Gives user control over which path to pursue.
  - Typical UI:
    - Short explanation + multiple choice options.

  - **Repo link**: `InterpretCard` (`kind: "interpret"`)
    - Our schema enforces **2–5 options**, exactly matching this pattern.
    - We treat this as a distinct card kind, not just "assistant text".

- **2.2 Proposals / Alternatives**
  - Pattern: When intent is clear, AI proposes several structured alternatives (e.g. "Option A: conservative" vs. "Option B: bold").
  - Benefits:
    - Encourages exploration instead of one-shot answers.
    - Allows user to compare and pick, rather than rewriting prompts.
  - Typical UI:
    - Card with options, each having label, summary, sometimes pros/cons.

  - **Repo link**: `ProposeCard` (`kind: "propose"`)
    - Same options pattern as interpret, but semantically "choose a path".

- **2.3 Structural & Spatial Patterns (Mockups)**
  - Pattern: AI helps with _structure_ (layout, regions, flows), not just content.
  - Example:
    - Suggesting screen regions, layout templates, or navigation structures.
  - Typical UI:
    - Visual sketches, grouped sections, region labels.

  - **Repo link**: `MockupCard` (`kind: "mockup"`)
    - Encodes regions with `layout` metaphors (`"shelf" | "bookcase" | "library"`).

- **2.4 Lenses / Inspectors**
  - Pattern: Instead of answering directly, AI exposes a **lens** on underlying structure:
    - Entities, flows, permissions, screens, constraints.
  - Benefits:
    - Builds shared understanding.
    - Makes it easier to reason about complex domains.

  - **Repo link**: `LensCard` (`lensType: "entities" | "flows" | "screens" | "permissions"`)
    - Our `payload` is the structured domain view.

- **2.5 Graceful Errors**
  - Pattern: When AI is uncertain or data is missing, show a clear error _with a way forward_.
  - Typical UI:
    - Error message + suggestions ("Provide example data", "Narrow the scope", etc.).

  - **Repo link**: `ErrorCard` (`errorKind`, `recoveryHint`)
    - Encodes uncertainty and recovery as designable objects.

---

## 3. Dynamic Interfaces in AI (24:27–28:40)

> The UI should change based on what the user did and what the AI inferred.

- **Static vs. dynamic**
  - Static: same chat input + transcript for everything.
  - Dynamic:
    - After initial input, show interpret options.
    - After disambiguation, show proposals.
    - After commitment, show lens/mockup or artifact edits.

- **Examples**
  - Content tools that switch from chat to multi-column comparison views.
  - Design tools that morph from chat to layout suggestions.

- **Alignment with this repo**
  - Our **phase** model (`discover` → `shape` → `inspect` → `error`) is exactly this dynamic interface logic.
  - `/api/cards` uses `phase` to decide which card kind to emit.
  - `MessageView` + `card-registry` adapt the visible interface based on the card kind.

---

## 4. Old-School Affordances in AI Products (28:40–30:04)

> We still need good old UX fundamentals.

- **Affordances we risk losing**
  - Buttons, labels, progress indicators.
  - Undo/redo, history, breadcrumbs.
  - Clear confirmation and cancellation flows.

- **Why they matter**
  - AI output is uncertain; users need grounding and clarity.
  - Familiar patterns reduce cognitive load and anxiety.

- **Alignment with this repo**
  - Cards _are_ explicit affordances:
    - Titles, descriptions (`CardBase`).
    - Option buttons (`InterpretCard`, `ProposeCard`).
    - Potential step indicators (`flowId`, `stepIndex`).
  - Our architecture encourages explicit UI components, not just text streams.

---

## 5. Taking Advantage of Loading States (30:04–33:00)

> Loading is not just dead time; it’s a chance to communicate.

- **Common anti-pattern**
  - Spinners that say nothing about what’s going on.

- **Better patterns**
  - Explain what’s happening: "Analyzing your flows", "Scanning entities".
  - Progressive loading:
    - Show outline first, details later.
    - Allow users to interact with partial results.

- **Alignment with this repo**
  - Our "progressive JPEG" process mirrors this idea:
    - Slice 1: simple interpret card, even if backend is stubbed.
    - Later passes: richer proposals, lenses, and mockups.
  - We can introduce **loading cards** or skeleton variants of `LensCard`/`MockupCard` to embody this pattern.

---

## 6. Designing for Trust in AI Experiences (33:00–37:10)

> Trust is about transparency, control, and predictability.

- **Trust challenges in AI**
  - Unclear why an answer was chosen.
  - Hard to see what data was used.
  - Model hallucinations presented with too much confidence.

- **Patterns for trust**
  - Explainable outputs: show the reasoning, structure, or source.
  - Let users inspect intermediate representations (entities, flows, constraints).
  - Offer obvious ways to correct the system.

- **Alignment with this repo**
  - **Lens cards**: expose underlying models/state as inspectable JSON (or richer UI later).
  - **Error cards**: explicitly acknowledge uncertainty and suggest recovery paths.
  - **Schema + phases**: codify stable patterns, so behavior is more predictable.

---

## 7. Designing the Refinement Journey (37:10–43:51)

> Refinement should feel like collaboration, not re-prompting.

- **Painful refinement today**
  - Users: type long prompts, get long answers, then tweak prompts or say "no, that’s not it".
  - No clear "next step" affordances.

- **Better refinement patterns**
  - Start broad; immediately follow up with structured clarifications.
  - Provide side-by-side options for direction, tone, structure.
  - Encode common refinements as clickable actions, not rephrased prompts.

- **Alignment with this repo**
  - Our card sequence is literally a _refinement journey_:
    - `interpret` → clarify user intent.
    - `propose` → offer structured paths.
    - `mockup`/`lens` → inspect and refine structure.
  - The **phase machine** drives this journey in code.

---

## 8. Quiet AI vs. Visible AI (43:51–50:53)

> Not every AI action needs to be surfaced; some should be quiet.

- **Visible AI**
  - Explicit interactions: suggestions, explanations, cards, previews.
  - Good for big decisions, where users need understanding and control.

- **Quiet AI**
  - Background improvements: better defaults, auto-completion, subtle ranking.
  - Good for reducing friction without adding noise.

- **Design questions**
  - When is it worth surfacing an AI action?
  - When should we be opinionated but quiet?

- **Alignment with this repo**
  - Cards represent **visible AI**: structured, inspectable, clickable units.
  - Quiet AI can still exist in parallel:
    - Adjusting artifact views or defaults without new cards.
    - Pre-filling card content based on context.
  - Our architecture lets us choose per interaction whether it’s a card or a quiet change.

---

## 9. Future Use Cases & Exciting Directions (50:53–52:56)

> Beyond chat: AI as co-designer, co-pilot, and structural partner.

- **AI as co-designer**
  - Suggesting layout options, flows, content structures.
  - Iterating on design artifacts, not just text content.

- **Deeply embedded AI**
  - AI that understands the domain model (entities, screens, permissions).
  - Context-aware assistants integrated into workflows, not just "a chat tab".

- **Alignment with this repo**
  - **MockupCard**: AI proposing structural layouts.
  - **LensCard**: AI revealing domain models.
  - **Artifacts**: our domain types and storage make these objects first-class.
  - Cards become the conversational _front-end_ to artifact operations.

---

## 10. How AI Changes the Role of Designers (52:56–end)

> Designers are now pattern-shapers and system choreographers.

- **From screens to systems**
  - Designers must specify:
    - Patterns, flows, and guardrails for AI behavior.
    - When AI speaks, when it stays quiet.
    - How uncertainty and errors are presented.

- **New responsibilities**
  - Designing conversation patterns, not just layouts.
  - Thinking in terms of states and transitions (phases, journeys).
  - Encoding design decisions into schemas and contracts the AI must follow.

- **Alignment with this repo**
  - `AGENTS.md`, `PLAN.md`, `card.schema.json`, and `AnyCard` are all **design artifacts** as much as engineering.
  - We’re encoding Vitaly’s patterns into:
    - A typed domain model.
    - JSON Schema for `response_format: json_schema`.
    - A phase machine with named card kinds.
  - This is exactly the shift he’s advocating: design the system’s behavior, not just its static surfaces.
