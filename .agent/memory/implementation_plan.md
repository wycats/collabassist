# Collabassist Implementation Plan

**Collabassist** is an experimental SvelteKit app for exploring card‑based AI interaction patterns.
Our goal is to move beyond "chat" into **Collaborative Intelligence**, where humans act as Architects and AI as a Junior Partner.

## Core Design Vision

> [!NOTE]
> For the full architectural philosophy and detailed concepts, see [design_vision.md](design_vision.md).

### 1. The Decisions Rail
The **Decisions Rail** is the "commit log" of the project. It is a sparse, structured timeline of **Accepted Cards**.
-   **Purpose**: To provide a single, authoritative place to see "what we have decided".
-   **Structure**: A horizontal rail of nodes. Each node represents an accepted decision (e.g., "Workspace Model v2"). *(Note: This visualization is a hypothesis; we will iterate based on usage.)*
-   **Persistence**: Backed by a database to serve as the ground truth for future AI context.

### 2. Vocabulary of Moves
We interact through structured moves, not just open-ended chat:
-   **Accept**: Commit a card to the Rail.
-   **Refine**: Iterate on a decision (v1 -> v2) via chat or structured inputs.
-   **Fork**: Create a branch to explore an alternative path.

### 3. Structured Canvas
The UI emphasizes the **Work** (Rail + Active Artifact) over the **Chat**, but allows for fluid transitions.
-   **Canvas**: The center stage for the active card or artifact.
-   **Rail**: The persistent context at the top.
-   **Chat**: A companion stream for ephemeral communication. We aim for a fluid balance where the chat can become prominent when needed.
-   **Visualizing Models**: We need delightful, interactive visualizations for data models (beyond static schemas) that allow users to "see" the system's thinking.

### 4. Abstraction-First
-   **Data Model is King**: Entities (Workspace, Member, Role) and invariants come first.
-   **Projections**: UI, API, and Docs are projections of this model.

---

## Working Agreement: Usable Slices

To ensure we don't get lost in architecture, we adhere to the **"Usable Slices"** constraint:
-   **End-to-End**: Every slice must result in a working, interactable feature. No "backend-only" or "UI-only" PRs.
-   **Demoable**: We must be able to demonstrate the new capability in the running app before moving to the next slice.
-   **No Dead Code**: We remove the old "happy path" hacks *as* we replace them, not after.
-   **Coherence Passes**: At natural phase boundaries, we pause to ensure our artifacts (`README`, `PLAN`, `Stories`) remain coherent with the implementation.
-   **Phase Transition Commits**: We commit our work regularly, especially when transitioning between phases or completing a slice.

---

## Roadmap & Slices

We build in **thin, end-to-end slices**. Each slice adds a concrete capability to the "Vocabulary of Moves" or the "Decisions Rail".

### Slice 1: The Decisions Rail (Foundation & Refactor)
**Goal**: Establish the "commit log" of the project and refactor away from hardcoded "happy paths".

**Demoable State**:
-   User can click "Accept" on a card.
-   The card appears as a node on the Rail.
-   Reloading the page preserves the Rail state (persisted in DB).
-   Clicking a node shows the card's content.

#### Refactoring Strategy
-   [ ] **Generic Decision Store**: Replace `planning-store.ts` (which has fixed slots for `interpret`, `propose`, `inspect`) with a `decisions-store.ts` that manages a generic list of `DecisionNode` items.
-   [ ] **Database Schema**: Create a `decisions` table in SQLite (using Drizzle) to persist the rail state.
    -   Columns: `id`, `card_id`, `parent_id` (for branching), `accepted_at`, `summary`.
-   [ ] **Abstract Orchestration**: Update `+page.svelte` to handle generic "Accept" events.
    -   Remove hardcoded `if interpret then propose` logic.
    -   Instead, an "Accept" action should simply append to the Rail and trigger the next appropriate AI turn based on the new context.

#### UI Implementation
-   [ ] **Rail Component**: Transform `PlanningPanel` into a horizontal **Decisions Rail**.
    -   Render the list of nodes from the store.
    -   Clicking a node shows the historical card state.

### Slice 2: The Refine Loop (Completed)
**Goal**: Allow iteration on a decision without losing context.
-   [x] **Interaction**: Add "Refine" action to cards.
-   [x] **Refine Panel**: Create a side panel for structured refinement (e.g., "Rename", "Adjust Constraints") + Chat input.
-   [x] **Versioning**: "Refining" a card produces a new version. "Accepting" it updates the head of the Rail.

### Slice 3: Fork & Branching (Completed)
**Goal**: Explore alternatives without cluttering the main line.
-   [x] **Interaction**: Add "Fork" action.
-   [x] **Data**: Support branching in the `decisions` table (`parent_id`).
-   [x] **UI**: Visualize branches in the Rail (Active Path: Root -> ... -> Head).

### Slice 4: Structured Canvas Layout (Completed)
**Goal**: Shift the UI gravity from "Chat" to "Work" and enable branch navigation.
-   [ ] **Layout**: Move Chat to a sidebar or drawer.
-   [ ] **Center Stage**: Dedicate the main area to the **Active Card** or **Artifact**.
-   [ ] **Branch Navigation**: UI to visualize the tree and switch between branches (changing the Active Path).
-   [ ] **Visuals**: Better rendering for Data Models (interactive diagrams) and Mockups.

### Slice 5: Real Model Integration

**Goal**: Replace mocked logic with Vercel AI SDK and OpenAI.

### [NEW] [schemas.ts](file:///home/wycats/Code/collabassist/src/lib/ai/schemas.ts)
- Define Zod schemas for `InterpretCard`, `ProposeCard`, `MockupCard`, `LensCard`.
- Export these for use in the API handler.

### [MODIFY] [cards/+server.ts](file:///home/wycats/Code/collabassist/src/routes/api/cards/+server.ts)
- Import `google` from `@ai-sdk/google`.
- Fetch `activePath` context from the request (client will need to send this).
- Construct a system prompt that explains the "CollabAssist" role and the available moves.
- Use `generateObject` with `google('gemini-1.5-pro')` and the appropriate schema.

### [MODIFY] [+page.svelte](file:///home/wycats/Code/collabassist/src/routes/+page.svelte)
- Update `handleCardSubmit` and `handleFork`/`handleRefine` to send the `activePath` (decision history) in the API request body.

## Verification Plan
- **Manual**:
    - Run the full loop: Interpret -> Propose -> Mockup.
    - Verify the AI generates relevant content based on the input.
    - Verify "Fork" generates a valid alternative.
    - Verify "Refine" updates the card correctly.

---

## Tech Stack & Guidelines
-   **Framework**: Svelte 5 + SvelteKit
-   **Styling**: Tailwind 4 + Skeleton 3 (Scoped CSS over BEM)
-   **Database**: SQLite + Drizzle
-   **AI**: Vercel AI SDK (Model-agnostic, Schema-driven)
