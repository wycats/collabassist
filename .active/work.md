## Mockup Visualization Refinement Sketch (Nov 17, 2025)

### Goals

- Keep mockups feeling like **data-first sketches**: light structure hints, minimal chrome, JSON always close at hand.
- Ensure each proposal path produces a distinct inspect artifact (lens vs. mockup variants) so the inspect phase carries real information.
- Mirror whatever we render in the thread inside the pinned planning panel to maintain a single source of truth.

### Completed Improvements

1. **Region grouping sketch – done**
   - `MockupRegions.svelte` renders shelves/bookcases/libraries with semantic markup, scoped selectors, and layout-based grouping.

2. **Inline JSON toggle – done**
   - Mockup and lens cards now expose `<details>` inspectors; planning panel mirrors them with compact presenters.

3. **Distinct artifacts per proposal – done**
   - `/api/cards` emits unique inspect artifacts: minimal, dashboard, and workspace each produce distinct mockup skeletons purpose-built for their architecture.

4. **Planning panel sync – done**
   - The pinned plan reuses the mockup presenter and the new `LensSummary` component so inspect artifacts stay visible outside the thread.

### Open Questions

- Do we want the JSON toggle to persist per card (remember open state) or reset when the card re-renders?
- Should we add lightweight icons/labels for layout types, or keep it purely textual for now?
- How do we want to surface non-mockup inspect artifacts (e.g. table lenses) in the planning panel without crowding it?

### Next Steps

- **Skeleton layout – iteration complete**
  - `MockupRegions.svelte` now renders a recursive skeleton layout that matches the spec in `docs/ai/mockup-layout-spec.md` (stack of rows, optional sidebar row, letters + legend).
  - Shelves are full-width bands; sidebars materialize only when `availableUnits ≥ 3`.

- **Selection status motif – design notes**
  - Treat "interpretation/proposal locked" updates as lightweight activity markers rather than full cards.
  - Use a shared **primary-colored dot** motif to visually connect:
    - the inline selection summary in the thread, and
    - the pinned intent/path entries in `PlanningPanel.svelte`.
  - Inline summary (thread):
    - Compact, at most two lines.
    - Layout: subtle vertical rail + primary dot on the left; single line of text `Interpretation locked: {label}` or `Proposal locked: {label}`, with an optional second line for the summary.
    - Colors: dot uses `var(--color-primary-500, oklch(0.57 0.21 258.29))` with a soft halo against the surface tokens already in use.
  - Pinned plan (sidebar):
    - Add a matching dot next to the "Intent" and "Path" labels or current values so the eye links the status line to the artifact state.
    - Keep typography and spacing aligned with existing Skeleton tokens; the dot should feel like an accent, not a new component.

#### Layout "Prettier" Specification (Nov 17, 2025)

The detailed layout algorithm now lives in `docs/ai/mockup-layout-spec.md`.

High-level intent:

- Treat the mockup presenter as a tiny, recursive layout formatter over a small set of primitives (`layout`, `role`, `availableUnits`).
- Build a simple tree (`stack` of `rows`, with optional `sidebar` rows) that can be rendered consistently in the thread, planning panel, and future artifact views.
- Keep shelves full-width, use at most two columns, and let sidebars materialize only when there is enough capacity for a 1:2 split.

- **Inspect artifact as separate sidebar card – done**
  - The main layout renders `PlanningPanel` and `InspectArtifactCard` as sibling cards in the sidebar rather than nesting inspect details inside the planning card.
  - `InspectArtifactCard` is fed from `currentPlan.inspect`, reusing the skeleton/legend presenters for mockup and lens artifacts.

- **Future work**
  - Extend inspect payloads for future proposal branches (e.g. command palette prototype) so each option has a signature artifact and skeleton treatment.
  - Plan how mockup/lens presenters migrate into the eventual artifact side panel for longer-lived collaboration.
