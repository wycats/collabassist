# UI Styling Guide

This guide captures our day-to-day styling conventions for Svelte components. It translates the guardrails from [AGENTS.md](../../AGENTS.md) into practical steps contributors can follow.

## 1. Markup First

- **Use semantic elements** – If the content is a list, use `<ul>/<li>`. Reach for headings, `<section>`, `<header>`, etc. instead of anonymous `<div role="list">` wrappers.
- **Avoid ornamental classes** – Do not add `class="region-item"` (or similar) purely to make CSS selectors work. If an element does not need a semantic hook, leave it unclassified.
- **Add roles only when semantics fall short** – If the platform already provides the right element, prefer it over ARIA roles. Roles are reserved for cases where no native element expresses the structure.

## 2. Component-Scoped CSS

- **Selector scope is free** – Svelte’s scoped styles already isolate selectors, so `ul { … }` or `li[data-layout='shelf'] { … }` will not leak. Use that instead of manufacturing classes for every child.
- **No BEM hierarchies** – Skip `card__region--shelf` naming. Lean on element selectors, and only introduce a class when a component needs different styles for multiple instances of the same element.
- **Data attributes for variants** – When you need variant styling or stateful cues, add a descriptive attribute such as `data-layout="shelf"`. They keep markup readable and double as lightweight documentation.
- **Minimal helper classes** – Classes are acceptable for truly shared primitives (e.g., `.header` reused inside the same template) but not as the default. If you notice yourself creating `item`, `item-content`, `item-label`, pause and reconsider whether element selectors or data attributes suffice.

## 2.1 Theme Tokens (Skeleton + Tailwind 4)

- **Treat this repo as the source of truth** – Token names come from our Tailwind 4 + `@theme` setup, not from generic Skeleton docs.
- **Use existing tokens** – Before you reference a custom property, search the repo or inspect DevTools. In practice you should see names like `--color-surface-50`, `--surface-900`, or `--color-primary-500`, not `--sk-color-*`.
- **No invented `--sk-*` tokens** – If a `--sk-*` variable is not present anywhere in the compiled CSS, don't introduce it. Prefer `--color-*` / `--surface-*` (or a nearby literal value) that already exists.
- **Align with neighbors** – When styling a new card, take cues from adjacent components so colors and surfaces stay coherent.

## 3. Reference Implementations

Two card components embody this approach:

- `src/lib/cards/MockupCard.svelte`
  - Semantic container structure with minimal helper classes and a JSON `<details>` inspector.
  - Delegates region geometry to `MockupRegions.svelte`, which uses a small recursive layout tree and `data-layout` attributes instead of ornamental classes.

- `src/lib/cards/LensCard.svelte`
  - Uses headings and `<pre>` for structured payloads.
  - Relies on scoped element selectors and existing theme tokens for surfaces and borders.

Use these components as patterns for future cards and panels. When a component grows large, organize it into smaller semantic subcomponents instead of falling back to global class scaffolding.

## 4. What Comes Next

Color, spacing, and sizing rules (including Utopia-based scales) will land in a follow-up revision. Until then, prefer this project's theme tokens (for example `var(--color-surface-50)`, `var(--surface-900)`, `var(--color-primary-500)`) for color, rem-based spacing, and keep values consistent with nearby components.
