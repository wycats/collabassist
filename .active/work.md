## Mockup Visualization Refinement Sketch (Nov 17, 2025)

### Goals

- Keep mockups feeling like **data-first sketches**: light structure hints, minimal chrome, JSON always close at hand.
- Ensure each proposal path produces a distinct inspect artifact (lens vs. mockup variants) so the inspect phase carries real information.
- Mirror whatever we render in the thread inside the pinned planning panel to maintain a single source of truth.

### Improvements to Implement

1. **Region grouping sketch**
   - Treat the mockup as stacked shelves/bookcases/libraries instead of isolated cards.
   - Use semantic markup (`<section>`, `<ul>`, `<li>`) plus `data-layout` attributes to convey the layout type.
   - Visually hint hierarchy via padding/border accents per layout (`shelf` = narrow band, `bookcase` = medium block, `library` = full-width slab).
   - Avoid new classes unless a helper block truly repeats; rely on scoped element selectors.

2. **Inline JSON toggle**
   - Add a small “View JSON” affordance (native `<details>` or `popover` button) inside `MockupCard`.
   - When toggled, reveal a `<pre>` (or minimal inspector) showing the `MockupCard` spec.
   - Keep it lightweight so it reinforces the data-oriented framing without overwhelming the sketch.

3. **Distinct artifacts per proposal**
   - Extend `/api/cards` stubs so each proposal option returns a unique inspect artifact:
     - e.g. “Workspace layout” → mockup with navigation + content regions.
     - “Lens deep dive” → lens card highlighting flows/JSON.
     - “Command palette prototype” → mockup emphasizing action rows, etc.
   - Later, align prompts so the model emits these shapes, but for now hard-code representative differences.

4. **Planning panel sync**
   - Reuse the same mockup presenter (or snippet) inside `PlanningPanel` so pinned artifacts match the thread view.
   - If the JSON toggle exists in the card, consider a simplified badge/link in the panel that opens the same data.

### Open Questions

- Do we want the JSON toggle to persist per card (remember open state) or reset when the card re-renders?
- Should we add lightweight icons/labels for layout types, or keep it purely textual for now?
- How do we want to surface non-mockup inspect artifacts (e.g. table lenses) in the planning panel without crowding it?

### Next Steps

- Prototype the stacked-region markup + styles directly in `MockupCard.svelte`.
- Add the `<details>`-based JSON reveal.
- Update `/api/cards` stubs for multiple inspect artifacts.
- Factor a shared presenter for planning panel reuse.
