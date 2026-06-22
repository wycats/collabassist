# Design Vision: Collaborative Intelligence

This document captures the shared design philosophy and architectural vision for Collabassist. It serves as the "North Star" for our implementation plan.

For the product-facing version of this vision, see the top-level `VISION.md`.

## Core Thesis

**Collaborative Intelligence**: We are building a system for co-creation where humans act as **Architects** (setting goals, constraints, trade-offs) and AI acts as a **Junior Partner** (exploring patterns, generating options, drafting artifacts).

## Key Concepts

### 1. The Decisions Rail

The **Decisions Rail** is the "commit log" of the project, visualized as a sparse, structured timeline.

- **Purpose**: To provide a single, authoritative place to see "what we have decided" without digging through chat scrollback.
- **Structure**: A horizontal rail of nodes representing the **Active Path** (Root -> ... -> Head).
- **Content**:
  - **Decision**: "Chose workspace model v2"
  - **Artifact**: Links to the specific schema/spec/mockup version.
  - **Context**: Who accepted it and when.
- **Interaction**:
  - Clicking a node reveals the full card/context.
  - New "Accept" actions append to the rail.
  - "Refine" updates the current head of the rail.
  - "Fork" creates a new branch; the Rail visualizes the path to the currently active head.

### 2. Vocabulary of Moves (Accept / Refine / Fork)

Cards are interactive units of work that support distinct moves:

- **Accept**: Commits the card to the Decisions Rail. "This is part of the story now."
- **Refine**:
  - **Chat-based**: User says "Make it blue".
  - **Structured**: User picks from a palette of common refinements (e.g., "Naming", "Edge Cases").
  - **Effect**: Updates the _same_ logical decision (v2, v3) on the rail.
- **Fork**:
  - **Action**: Creates a variant path (e.g., "Workspace - Lightweight" vs "Workspace - Enterprise").
  - **Effect**: Branches the artifact context. The rail may show parallel strands or allow switching between branches.

### 3. UI as Intelligence (Structured Canvas)

- **Beyond Chat**: The chat thread is for ephemeral communication. The "real work" happens in structured views.
- **Canvas Feel**: We will shift screen real estate towards a **Structured Canvas** that houses the Decisions Rail and the active Artifact/Board, treating the chat as a companion stream.
- **Visualizing Models**: We need delightful, interactive visualizations for data models (beyond static schemas) that allow users to "see" the system's thinking.

### 4. Abstraction-First

- **Data Model is King**: Entities (Workspace, Member, Role) and invariants come first.
- **Projections**: UI, API, and Docs are projections of this model.

## Implementation Priorities

1.  **Decisions Rail**: Transform the current `PlanningPanel` into a true Decisions Rail.
2.  **Refine Flow**: Implement "Refine" actions that allow chat-based iteration on a specific card, producing v2/v3 versions.
3.  **Structured Canvas**: Evolve the layout to emphasize the artifact/rail over the chat stream.

## Current Limitations & Technical Debt

While we have established the core "Decisions Rail" and "Vocabulary of Moves" (Accept/Refine/Fork), significant limitations remain:

1.  **Gateway Smoke Pending**: `/api/cards` now routes through a server-side card-generator adapter with deterministic `fake` mode and opt-in Vercel AI Gateway mode. The remaining integration risk is a live Gateway smoke after `vercel login`, `vercel link`, and `vercel env pull .env.local`.
2.  **Artifact Semantics**: Accepted mockup/lens inspect cards now create durable `product-spec` artifacts, and the canvas follows the active branch path. The long-term artifact revision and merge model still needs product/design attention.
3.  **Version Semantics**: Refine and fork candidates now persist into real branch paths when accepted, but the long-term version model still needs product/design attention.
4.  **Product Goal Reset Complete**: The current wedge is a single-user beta for turning fuzzy product ideas into resumable product-spec artifacts.

## Refactoring Strategy (Completed)

We have successfully refactored the core to support the vision:

- [x] **Generic Rail Store**: Replaced `planning-store.ts` with `decisions-store.ts` (generic `DecisionNode` list).
- [x] **Abstract Card Handling**: `+page.svelte` now handles generic "Accept", "Refine", and "Fork" events.
- [x] **Database-Backed**: The `decisions` table in SQLite now persists the rail state and supports branching.
- [x] **Project + Artifact Persistence**: The workspace now persists projects and branch-aware `product-spec` artifacts produced by accepted inspect cards.
