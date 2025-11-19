# Mockup Layout "Prettier" Specification

This document describes the small, recursive layout algorithm used by `MockupRegions.svelte` to turn a flat list of mockup regions into a simple skeleton layout.

## Primitives

- Each region has:
  - `layout ∈ {"shelf", "bookcase", "library"}` – controls relative height.
  - `role ∈ {"sidebar", "switcher", "content"} | undefined` – controls where it appears.

- The presenter also receives a coarse **capacity hint** from the caller:
  - `availableUnits ∈ ℕ` – how many "column units" the surrounding layout can afford for this mockup.
  - By convention, "enough space for a sidebar" means `availableUnits ≥ 3` (1 unit for a sidebar rail, 2 units for the main stack).

## Derived groups (local view)

For a given list of `regions`, we still talk about `sidebar` / `switcher` / `content`, but this is a **local, per-step view** inside the recursive algorithm, not a single global partition:

- At each step, given a slice of `regions` (the current tail):
  - `next` is the first region in that slice.
  - If `next.role === "sidebar"`, we say this step has a `sidebar`.
  - Otherwise `next` is treated as content in this step.
  - The **remainder** of the slice (`rest`) is passed recursively to build the following rows.

## Layout tree (recursive view)

Instead of a single global mode, the presenter builds a small **layout tree** recursively.

- The root is always a **stack node** with:
  - `kind = "stack"`
  - `rows: Row[]` (ordered)

- Each `Row` is either:
  - A **shelf row**: `{ kind: "shelf"; region }` – one region taking the full width, or
  - A **sidebar row**: `{ kind: "sidebar"; sidebar; main: Stack }` – a sidebar column next to a nested stack of rows.

There is no global `mode` field in the data model; the notion of "stacked", "switcher-only", and "sidebar" becomes **descriptive** of the tree shape:

- "stacked" → root stack with only shelf rows.
- "switcher-only" → root stack whose first row is a shelf for a `switcher` region.
- "sidebar" → at least one row with `kind = "sidebar"`.

## Height tokens

- Map `layout` to relative heights (values are approximate and can be tuned, but the ordering matters):
  - `shelf` → short band (e.g. `HS = 0.9rem`).
  - `bookcase` → medium band (e.g. `HB = 1.6rem`).
  - `library` → tall band (e.g. `HL = 2.4rem`).

These heights apply regardless of tree shape; only the column/row placement changes.

## Global invariants

- **Shelves**
  - A `shelf` is always a **full-width band** within its area (root stack or any nested `main` stack inside a sidebar).
- **Stack**
  - A stack is a **single column** where each child is a full-width row.
  - Only row height varies with `layout`.
- **Columns**
  - The presenter uses at most **two columns**:
    - Left: sidebar column (when a sidebar row exists at this level).
    - Right: main area column (always a vertical stack).
  - We do **not** create additional sub-grids or third columns in the main area.

## Role behaviors (quantum fit vs. switch)

### Sidebar (`role = "sidebar"`)

- Treated as a **quantum column role**: a function of `availableUnits`.
- Define `sidebarBehavior(availableUnits) ∈ {"stack", "shelf"}`:
  - If `availableUnits ≥ 3` → `"stack"` (manifest as a dedicated sidebar column next to a main stack).
  - Else → `"shelf"` (manifest as a full-width band in a single-column stack).
- When `sidebarBehavior(availableUnits) = "stack"`, we say the layout at that level is in **sidebar column mode**.

### Shelf (`layout = "shelf"`, any role except `"sidebar"`)

- Treated as a **pure shelf role**.
- Always fills its entire row in whichever area it belongs to (single-column stack or main column next to a sidebar).
- Never tiled; has no additional fit/switch decision beyond its row height.

### Switcher (`role = "switcher"`)

- Treated as a **quantum shelf-like role** whose behavior depends on whether a sidebar column exists at the current level.
- In the current implementation, switchers are rendered as shelves with a distinct visual accent.
- A future refinement may promote switchers to an explicit row kind (e.g. `kind = "switcher-shelf"`).

## Recursive layout algorithm (sketch)

Let `buildStack(regions, availableUnits) -> Stack` be defined as:

1. If `regions` is empty, return `Stack { rows: [] }`.
2. Let `next = regions[0]`, `rest = regions.slice(1)`.
3. Decide how `next` wants to manifest:
   - If `next.role === "sidebar"` and `sidebarBehavior(availableUnits) = "stack"`:
     - Create a `sidebar` row:
       - `sidebar = next`.
       - `main = buildStack(rest, availableUnits)` (the sidebar sits next to a stack built from the remainder).
     - Return `Stack { rows: [ { kind: "sidebar", sidebar, main } ] }`.
       - Note: the sidebar row consumes the entire vertical span at this level; we stop at this level and do not add more sibling rows here.
   - Else:
     - Treat `next` as a shelf row: `row = { kind: "shelf", region: next }`.
     - Recursively build the remainder: `tailStack = buildStack(rest, availableUnits)`.
     - Return `Stack { rows: [ row, ...tailStack.rows ] }`.

This yields a simple, predictable tree:

- Zero or more shelf rows at each level until a sidebar chooses to materialize.
- Optionally one sidebar row per level, whose `main` contains its own shelves/switchers/content recursively.

## Rendering notes

- When the root stack has a single `sidebar` row, `MockupRegions.svelte` renders a 2-column grid:
  - Left column: the sidebar region.
  - Right column: the root `main` stack rows.
- Otherwise, the root is rendered as a single stacked column of shelves.
- Nested stacks within a sidebar `main` are rendered as if they were root stacks, but within the main column.
