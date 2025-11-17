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
   - `/api/cards` emits unique inspect artifacts: minimal + workspace produce different mockups, dashboard surfaces a lens summary.

4. **Planning panel sync – done**
   - The pinned plan reuses the mockup presenter and the new `LensSummary` component so inspect artifacts stay visible outside the thread.

### Open Questions

- Do we want the JSON toggle to persist per card (remember open state) or reset when the card re-renders?
- Should we add lightweight icons/labels for layout types, or keep it purely textual for now?
- How do we want to surface non-mockup inspect artifacts (e.g. table lenses) in the planning panel without crowding it?

### Next Steps

- Evolve mockup rendering into a **skeleton layout**:
  - Use stacked bands/blocks that visually imply sidebar, canvas, overlay, etc., with single-letter labels on the blocks and a legend underneath.
  - Keep the labels minimal in the skeleton itself and let the legend carry the detailed region descriptions.
  - Later, consider hover/click interactions that highlight the corresponding legend entry, but only after we are happy with the static skeleton.

- Make the inspect artifact a **separate sidebar card**:
  - In the main layout, render `PlanningPanel` and an `InspectArtifactCard` as sibling cards in the sidebar rather than nesting inspect details inside the planning card.
  - Feed `InspectArtifactCard` from `currentPlan.inspect`, reusing the skeleton/legend presenters for mockup and lens artifacts.

- Extend inspect payloads for future proposal branches (e.g. command palette prototype) so each option has a signature artifact and skeleton treatment.
- Plan how mockup/lens presenters migrate into the eventual artifact side panel for longer-lived collaboration.
