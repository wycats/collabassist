# Design Vision: Collaborative Intelligence

This document captures the shared design philosophy and architectural vision for Collabassist. It serves as the "North Star" for our implementation plan.

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
    - **Effect**: Updates the *same* logical decision (v2, v3) on the rail.
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

1.  **Mocked AI Integration**: The API (`/api/cards`) is currently mocked. It returns static JSON responses instead of connecting to the Vercel AI SDK. This is intentional for early slices but needs to be addressed in Slice 5.
2.  **Chat-First Layout**: The UI is still heavily chat-centric. The "Decisions Rail" is squeezed into a top panel, and there is no dedicated "Canvas" area for working on artifacts or visualizing the decision tree. This will be addressed in Slice 4.
3.  **Branch Navigation**: While the backend supports branching, the UI does not yet provide a way to visualize the tree structure or switch between branches (changing the active head).

## Refactoring Strategy (Completed)
We have successfully refactored the core to support the vision:
-   [x] **Generic Rail Store**: Replaced `planning-store.ts` with `decisions-store.ts` (generic `DecisionNode` list).
-   [x] **Abstract Card Handling**: `+page.svelte` now handles generic "Accept", "Refine", and "Fork" events.
-   [x] **Database-Backed**: The `decisions` table in SQLite now persists the rail state and supports branching.

