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
		display: flex;
		height: 100%;
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
		padding: 1rem;
	}

	main > div {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: clamp(1rem, 2.8vw, 2rem);
	}
</style>
