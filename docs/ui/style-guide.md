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

## 3. Reference Implementation

`src/lib/cards/MockupCard.svelte` embodies this approach:

- The markup is a semantic `<ul>` with `<li>` regions and a small `<div class="header">` helper where a reusable flex pairing is justified.
- Styling relies on scoped `ul`/`li` selectors plus a single `data-layout` attribute for variant backgrounds.
- No BEM, no redundant classes, no `div role="list"` stand-ins.

Use that component as the pattern for future cards and panels. When a component grows large, organize it into smaller semantic subcomponents instead of falling back to global class scaffolding.

## 4. What Comes Next

Color, spacing, and sizing rules (including Utopia-based scales) will land in a follow-up revision. Until then, prefer Skeleton tokens (`var(--sk-color-*)`) for color, rem-based spacing, and keep values consistent with nearby components.
