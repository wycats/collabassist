# De-BEMify Components Walkthrough

I have refactored `Button.svelte` and `CardOptionList.svelte` to remove BEM-style classes and utility classes, replacing them with scoped CSS and semantic HTML elements.

## Changes

### [Button.svelte](file:///home/wycats/Code/collabassist/src/lib/ui/Button.svelte)

- Removed `btn`, `btn-sm`, `btn-lg`, `btn-base` classes.
- Removed Skeleton UI preset classes (`preset-filled-primary-500`, etc.).
- Implemented scoped CSS using `data-variant` and `data-size` attributes.
- Used CSS variables (e.g., `--color-primary-500`) to maintain theme consistency.

```svelte
<!-- Before -->
<button class="btn btn-sm preset-filled-primary-500">...</button>

<!-- After -->
<button data-variant="primary" data-size="sm">...</button>
```

### [CardOptionList.svelte](file:///home/wycats/Code/collabassist/src/lib/cards/CardOptionList.svelte)

- Removed `.option-list`, `.option`, `.text`, `.label`, `.summary` classes.
- Replaced `ul.option-list` with `ul` (scoped).
- Replaced `button.option` with `button` (scoped).
- Replaced `span.label` with `strong`.
- Replaced `span.summary` with `small`.

```svelte
<!-- Before -->
<ul class="option-list">
  <li>
    <button class="option">
      <span class="text">
        <span class="label">Label</span>
        <span class="summary">Summary</span>
      </span>
    </button>
  </li>
</ul>

<!-- After -->
<ul>
  <li>
    <button>
      <span>
        <strong>Label</strong>
        <small>Summary</small>
      </span>
    </button>
  </li>
</ul>
```

## Verification

### Automated Checks
Ran `npm run check` to verify that the changes didn't introduce any type errors or syntax issues.

```
svelte-check found 0 errors and 1 warning in 1 file
```
(The warning is in `OptionToken.svelte` and is unrelated to these changes.)

### Browser Verification
Verified the changes in the browser by navigating to the local dev server and interacting with the components.

![Buttons and Options](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/buttons_and_options_1763514105424.png)

[Browser Recording](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/verify_components_1763514056232.webp)

### Slice 1: The Decisions Rail (Foundation & Refactor)

**Goal**: Establish the "commit log" of the project and refactor away from hardcoded "happy paths".

**Changes**:
-   **Database**: Added `decisions` table to SQLite schema.
-   **Store**: Replaced `planning-store.ts` with `decisions-store.ts`.
-   **API**: Created `/api/decisions` endpoint to persist accepted cards.
-   **UI**: Refactored `PlanningPanel.svelte` to render the Decisions Rail from the store.
-   **Orchestration**: Updated `+page.svelte` to handle generic "Accept" events (implicit in this slice via selection).

**Verification**:
-   **Manual Migration**: Ran `scripts/migrate_manual.js` to create the table (workaround for `drizzle-kit` prompt issue).
-   **Browser Verification**:
    1.  Injected sample interpret card.
    2.  Selected an option ("Define the data model").
    3.  Verified "Decisions Rail" updated to "1 Accepted".
    4.  Reloaded page.
    5.  Verified persistence.

**Evidence**:

*Decisions Rail Updated*:
![Decisions Rail Updated](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/rail_updated_1763569011180.png)

*Persistence after Reload*:
![Persistence after Reload](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/rail_after_reload_1763569056614.png)
### UI Refinement: Prompt Box

**Goal**: Replace the standard textarea with a "premium" AI-style prompt box that auto-expands.

**Changes**:
-   **Component**: Created `src/lib/ui/PromptBox.svelte` using `contenteditable="plaintext-only"`.
-   **Integration**: Updated `ChatComposer` and `+page.svelte` to use the new component.
-   **Styling**: Added a polished container with a submit button inside.

**Verification**:
-   **Browser Verification**:
    1.  Typed text into the new box.
    2.  Verified auto-expansion (via `contenteditable` behavior).
    3.  Verified `Shift+Enter` for newlines and `Enter` for submit.

**Evidence**:


*Verification Recording*:
![Prompt Box Verification](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/verify_prompt_box_1763569619213.webp)

### Slice 2: The Refine Loop (UI & Interaction)

**Goal**: Allow users to open a refinement context for any card.

**Changes**:
-   **Component**: Created `src/lib/chat/RefinePanel.svelte` as a side panel.
-   **Interaction**: Added "Refine" button (pencil icon) to `CardShell` header.
-   **Propagation**: Updated `MessageView` and all card components to propagate the `onRefine` event.
-   **State**: Updated `+page.svelte` to manage `refiningCard` state and toggle the panel.

**Verification**:
-   **Browser Verification**:
    1.  Injected sample card.
    2.  Clicked "Refine" button.
    3.  Verified `RefinePanel` opened with correct context.
    4.  Verified closing the panel.
-   **API Verification**:
    -   Verified `POST /api/cards` with `phase: 'refine'` returns a new card with "Refined:" prefix and updated description.
    -   Confirmed end-to-end flow: Refine -> Apply -> New Card in Chat.

**Evidence**:

*Refine Panel Open*:
![Refine Panel Open](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/verify_refine_loop_1763571293569.webp)

*Full Verification Recording*:
![Verification Recording](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/verify_decisions_rail_final_1763568973471.webp)

### Slice 3: Fork & Branching (Core Implementation)

**Goal**: Explore alternatives without cluttering the main line.

**Changes**:
-   **Interaction**: Added "Fork" button (branch icon) to `CardShell`.
-   **API**: Implemented `phase: 'fork'` in `/api/cards` to create a new branch.
-   **Data**: Updated `decisions` table usage to persist `parentId`.
-   **Visualization**: Updated `decisions-store.ts` and `PlanningPanel` to visualize the **Active Path** (Root -> ... -> Head).

**Verification**:
-   **API Verification**:
    -   Verified `POST /api/cards` with `phase: 'fork'` returns a new card with "Fork of:" title.
-   **Browser Verification**:
    1.  Injected sample card and accepted it (Root).
    2.  Forked the next card.
    3.  Accepted the fork.
    4.  Verified Rail shows 2 nodes (Root -> Fork).
    5.  Verified persistence after reload.

**Evidence**:
### Slice 4: Structured Canvas Layout (Phase 1)

**Goal**: Shift UI gravity from Chat to Work.

**Changes**:
-   **Layout**: Split `+page.svelte` into `Sidebar` (Chat) and `Canvas` (Rail + Artifact).
-   **Refactoring**: Removed `ChatShell` and legacy `planning-store.ts`.
-   **Components**: Updated `InspectArtifactCard`, `InterpretCard`, `ProposeCard` to be prop-driven.

**Verification**:
-   **Browser Verification**:
    1.  Verified 2-column layout.
    2.  Verified Chat works in Sidebar.
    3.  Verified Active Artifact appears in Canvas after acceptance.

**Evidence**:

*New Canvas Layout*:
![Canvas Layout](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/canvas_with_artifact_1763615944323.png)

### Slice 4: Structured Canvas Layout (Phase 2 - Branch Navigation)

**Goal**: Visualize and navigate the decision tree.

**Changes**:
-   **Data**: Added `heads` derived store and `setHead` action to `decisions-store.ts`.
-   **UI**: Added Branch Switcher dropdown to `PlanningPanel` when multiple branches exist.

**Verification**:
-   **Browser Verification**:
    1.  Created multiple branches via Forking.
    2.  Verified Dropdown appears.
    3.  Switched branches and verified Rail updates to show the correct path.

**Evidence**:

*Branch Switching UI*:
![Branch Switching](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/branch_switched_1763616745222.png)

*Branching Flow Verification*:
![Branching Flow](/home/wycats/.gemini/antigravity/brain/fce983af-bfd7-45ee-94b0-454f095359e2/verify_branching_flow_1763608044340.webp)
