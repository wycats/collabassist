<script lang="ts">
	import type { Snippet } from 'svelte';

	let { rail, children }: { rail: Snippet; children: Snippet } = $props();
</script>

<main>
	<header>
		{@render rail()}
	</header>
	<div>
		{@render children()}
	</div>
</main>

<style>
	main {
		--canvas-gap: 0.95rem;
		--canvas-scrollbar-gutter: 0px;
		--canvas-gutter: clamp(0.95rem, 2vw, 1.35rem);

		display: flex;
		min-height: 0;
		min-width: 0;
		flex-direction: column;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-50, white) 90%, transparent),
			color-mix(in srgb, var(--color-surface-100, #f4f4f5) 92%, transparent)
		);
	}

	header {
		border-bottom: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 78%, transparent);
		background: color-mix(in srgb, var(--color-surface-50, white) 82%, transparent);
		padding: var(--canvas-gutter);
		padding-inline-end: calc(var(--canvas-gutter) + var(--canvas-scrollbar-gutter));
	}

	main > div {
		min-height: 0;
		overflow-y: visible;
		padding: var(--canvas-gap) var(--canvas-gutter);
		scrollbar-gutter: stable;
	}

	@media (min-width: 768px) {
		main {
			--canvas-scrollbar-gutter: 1rem;

			height: 100dvh;
			max-height: 100dvh;
			overflow: hidden;
		}

		main > div {
			flex: 1;
			overflow-y: auto;
		}
	}

	@media (min-width: 1024px) {
		main {
			--canvas-gap: 1.1rem;
			--canvas-gutter: clamp(1.15rem, 1.9vw, 1.55rem);
		}
	}
</style>
