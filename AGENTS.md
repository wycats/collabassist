# AGENTS.md – AI Chat Client (Bits + Skeleton)

This document describes how AI agents (e.g. `gpt-5-codex`) should work on this repo. It encodes the architectural decisions, guardrails, and preferences for building and evolving the AI chat client.

---

## 1. Purpose of this Repo

This repo is an **experimental AI chat client** for exploring improved assistant interaction patterns.

The primary goals are:

- Treat the **message + artifact model** as the core of the system.
- Make it easy to experiment with **cards, flows, mockups, and artifacts** as first-class interactions.
- Use modern web primitives (Svelte 5, native `<dialog>`, Baseline CSS features) instead of legacy JS-heavy stacks.
- Avoid vendored component templates and keep abstraction boundaries clean.

When adding or editing code, always favor **clarity, composability, and explicit structure** over cleverness.

---

## 2. Tech Stack (What You Can Rely On)

- **Framework**: Svelte 5 (SvelteKit app)
- **Styling & Design System**: Skeleton 3 + Tailwind 4
- **Headless UI Primitives**: Bits UI (Svelte-first, unstyled components)
- **Modal Primitive**: Native `<dialog>` wrapped in `Dialog.svelte`
- **AI Runtime**: Vercel AI SDK (or equivalent) for:
  - chat completion
  - streaming responses
  - tool calls / function calls

When proposing or writing code, assume this stack and **do not introduce additional UI frameworks** (e.g. React, Vue) or vendored component systems.

---

## 3. High-Level Architecture

### 3.1 Core Concepts

There are three core concepts in this app:

1. **Messages** – units of conversation in the chat thread.
2. **Cards** – structured UI blocks embedded in the thread that enable richer interactions.
3. **Artifacts** – persistent objects that the assistant and user co-edit (documents, canvases, schemas, layouts, code, etc.).

### 3.2 Message Model

Agents should model messages with a **typed union** that is UI-agnostic. A typical shape:

```ts
// Pseudocode – actual types live in the codebase

type Role = 'user' | 'assistant' | 'system' | 'tool';

type MessageKind = 'text' | 'card' | 'artifact-link';

interface BaseMessage {
	id: string;
	role: Role;
	kind: MessageKind;
	createdAt: string;
}

interface TextMessage extends BaseMessage {
	kind: 'text';
	content: string; // markdown-ish
}

interface CardMessage<T = unknown> extends BaseMessage {
	kind: 'card';
	cardType: string; // e.g. 'choice', 'command', 'mockup'
	spec: T; // typed per cardType
}

interface ArtifactLinkMessage extends BaseMessage {
	kind: 'artifact-link';
	artifactId: string;
	label?: string;
}

// Union

type Message = TextMessage | CardMessage | ArtifactLinkMessage;
```

**Do not** bake UI details (like component names or Tailwind classes) into the message model. The model must remain **framework-agnostic**.

### 3.3 Card Registry & Rendering

Messages of `kind: 'card'` are rendered by a **card registry**:

- `cardType` → Svelte component
- Example mappings:
  - `choice` → `ChoiceCard.svelte`
  - `command` → `CommandPaletteCard.svelte`
  - `artifact-tabs` → `ArtifactTabsCard.svelte`
  - `mockup` → `MockupCard.svelte`

There should be one central `MessageView.svelte` that:

- switches on `message.kind` and `cardType`;
- delegates rendering to a card component;
- remains simple and easy to extend.

When adding a new card type, agents should:

1. Define/extend an appropriate TS type for `spec`.
2. Implement a new Svelte component (e.g. `FooCard.svelte`).
3. Register it in the card registry.
4. Update any card-related prompts or tool definitions as needed.

---

## 4. Design System & Layout Rules

### 4.1 Skeleton as the Design-System Shell

Skeleton + Tailwind provide:

- **Themes & tokens** – color palette, surface/background tokens, typography scale.
- **Utilities** – spacing, layout, flex/grid, etc.
- **Base visual primitives** – cards, badges, basic layout patterns.

Agents should:

- Use Skeleton and Tailwind **inside Svelte components**, not as large global utility layers.
- Prefer small, semantic layout components (e.g. `ChatShell.svelte`, `ChatThread.svelte`, `ChatComposer.svelte`) that encapsulate structure and styling instead of scattering long Tailwind class lists across pages.
- Keep global CSS (`app.css`) minimal:
  - framework imports (Tailwind, Skeleton, theme)
  - truly global concerns (e.g. `<dialog>` animation)
  - avoid app-specific `chat-*` utility classes when the same structure can live in Svelte components.

- Wrap Skeleton styles into small, app-specific components:
  - `Button.svelte`
  - `Card.svelte`
  - `Toolbar.svelte`
  - `MessageView.svelte`
  - `ChatShell.svelte` / `ChatThread.svelte` / `ChatComposer.svelte`

- Keep styling logic **separate from domain logic** (no business logic in UI components).

Skeleton is responsible for **tokens and base styling**. Layout and structure should be expressed via Svelte components and scoped CSS, not via large Tailwind-only blobs in route files.

### 4.2 Bits UI as the Interaction Toolkit

Bits UI is used for **complex interactions** where accessibility and state management matter:

- `Command` – command palette / quick actions.
- `Tabs` – multiple views on an artifact.
- `Accordion` – expandable sections in cards.
- `Menu` / `ContextMenu` – message and artifact actions.
- `Popover` / `Tooltip` – inline helper UI.

Agents should:

- Use Bits primitives for the patterns above.
- Style Bits components with Skeleton/Tailwind classes.
- Keep Bits usage localized (e.g. inside a card or tool panel component).

### 4.3 Component Conventions (Svelte 5)

- **Scoped CSS over BEM** – Components already scope styles, so prefer element selectors or lightweight class names. Avoid BEM-style naming; reach for classes only when necessary (e.g. targeting pseudo-states). See `docs/ui/style-guide.md` for concrete examples.
- **Semantic structure first** – Reach for the native element that expresses the structure (`ul`/`li`, headings, `<section>`) instead of `div role="list"` or meaningless wrappers. Only add roles when the semantic element truly cannot represent the structure.
- **No classes for scoping** – Scoped styles let us target `ul`, `li`, `[data-layout]`, etc. without inventing `chat__region-item` classes. Introduce a class only when the component needs multiple distinguishable instances of the same tag name.
- **Data attributes for variants** – When a variant needs styling, use small data attributes (`data-layout="shelf"`) that also describe the state to screen readers and future contributors.
- **Callbacks over Svelte events** – Instead of `createEventDispatcher`/`on:event`, pass callbacks via props (`onSubmit`, `onSelect`, etc.) so components compose like standard functions.
- **Snippets over legacy slots** – Svelte 5 favors `Snippet`s for composition. Use snippets (`children?: Snippet`) in shared shells/layouts (`ChatShell`, `CardShell`, etc.) rather than old slot APIs.

### 4.4 Baseline-First Interactions (Dialogs, Popovers, Etc.)

Agents must treat Baseline web features as the **first choice** for interaction patterns and only reach for Bits UI when the platform is missing behavior.

**Dialogs**

- Implement dialogs exclusively via a small `Dialog.svelte` wrapper around native `<dialog>`.
- Use `showModal()` / `show()` / `close()` internally, with an `open` prop and `close` event.
- Style and animate dialogs with Skeleton/Tailwind and Baseline CSS features (e.g. `@starting-style`), not JS-heavy portal/focus-trap stacks.
- Use dialogs only for **truly blocking** actions (confirmation, dangerous operations, first-time setup), not for layout.

**Other Baseline primitives**

- Prefer `<details>` / `<summary>` for simple disclosure when it fits.
- Prefer the `popover` attribute and related Baseline behavior for simple popovers.
- Prefer native form controls (`<button>`, `<input>`, `<select>`, `<textarea>`) styled with Skeleton over custom widget stacks, unless an advanced composite control is needed.
- Prefer Baseline CSS features (`:has`, `@starting-style`, logical properties, modern layout) before JS layout hacks or heavy animation libraries.

**When to use Bits UI**

- Use Bits UI only when Baseline primitives are insufficient for the interaction (e.g. a rich command palette, complex composite widgets, advanced keyboard interaction across multiple elements).
- Even when using Bits, keep the markup and styling aligned with Skeleton and platform semantics.

---

## 5. Artifacts: First-Class Persistent Objects

Artifacts are the persistent entities the assistant and user work with.

A typical shape:

```ts
// Pseudocode – actual types live in the codebase

interface Artifact {
	id: string;
	type: string; // e.g. 'doc', 'canvas', 'schema', 'layout', 'code'
	data: unknown; // JSON; typed per type via zod/TS
	createdAt: string;
	updatedAt: string;
	createdBy: 'user' | 'assistant';
}
```

Agents should:

- Keep artifact definitions in **shared domain modules**, not in UI files.
- Ensure any changes to artifact types are reflected in:
  - storage (DB / in-memory)
  - server-side tools
  - card components that display/edit them

Artifacts should be rendered via:

- An **artifact side panel** (e.g. `ArtifactPanel.svelte`) with Bits `Tabs`/`Accordion` where appropriate.
- Inline card views when the assistant introduces or updates an artifact.

---

## 6. AI Runtime & Tools

Agents should treat the AI runtime as a **separate layer** from the UI.

- Use Vercel AI SDK (or equivalent) on the server:
  - define tools (function calls) with clear types
  - manage streaming responses
  - remain provider-agnostic

- The Svelte client should call a single `/api/chat` (or similar) endpoint that:
  - accepts the message history (or a compact representation of it)
  - returns a stream of structured responses (including cards and artifact operations)

When adding tools, agents should:

- Define tools in a strongly typed way (TS + zod or similar).
- Focus tools on **domain actions**, such as:
  - `create_artifact`
  - `update_artifact`
  - `link_artifact`
  - `summarize_artifact`

- Avoid tools that directly emit raw HTML/JSX. The model should produce **structured data**; the UI decides how to render it.

---

## 7. UX Principles for the Chat Client

When changing or extending the UX, agents should adhere to these principles:

1. **Chat shell is simple and explicit**
   - A clear layout: sidebar (optional), main thread, artifact panel.
   - A straightforward composer: text input + send button.
   - Minimal hidden state; props and store usage should be obvious.

2. **Cards and artifacts are the main interaction levers**
   - Use cards to propose options, flows, or structured edits.
   - Use artifacts to hold “stable” knowledge and structure.
   - Avoid overloading plain text for complex structure when a card or artifact would be clearer.

3. **Prefer coarse, understandable interactions**
   - Clear “select from options”, “confirm”, “edit this artifact” flows.
   - Avoid subtle UI tricks that are hard to debug or reason about.

4. **Keep model prompts in sync with UI capabilities**
   - If you add a new card type or artifact view, update the prompts/tools so the model can use it.
   - Do not ask the model to use UI concepts that don’t exist yet.

---

## 8. Constraints & Anti-Patterns

The following are **explicitly out of scope** for this repo (unless the maintainer changes this file):

- No vendored component libraries (e.g. shadcn-style copy-paste components, jsrepo dumps).
- No React/Vue/Angular-based UI inside this Svelte app.
- No library-based dialog abstractions; always use native `<dialog>` via `Dialog.svelte`.
- No direct HTML/JSX generation by the model; the model must work with structured data (messages, cards, artifacts, tools).
- Avoid over-abstracting early; prefer small, explicit components that are easy to refactor later.

---

## 9. How Agents Should Work in This Repo

When making changes or generating new code, agents should:

1. **Locate the relevant domain types first** (messages, cards, artifacts) and work with them instead of recreating new shapes.
2. **Honor the stack**: Svelte 5 + Skeleton + Tailwind + Bits + native `<dialog>` + AI SDK.
3. **Keep files small and focused**:
   - Domain models in domain modules.
   - UI components in `lib/ui` or `routes` as appropriate.
   - Server logic in API routes / server modules.

4. **Update this document** if architectural decisions materially change.

If in doubt between two options, prefer the one that:

- preserves the message/artifact model cleanly;
- uses platform capabilities (native elements, Baseline CSS) over heavy abstractions;
- makes it easier to experiment with new cards and flows.
