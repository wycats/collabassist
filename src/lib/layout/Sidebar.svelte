<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, footer }: { children: Snippet; footer?: Snippet } = $props();
</script>

<aside>
	<div>
		{@render children()}
	</div>
	{#if footer}
		<footer>
			{@render footer()}
		</footer>
	{/if}
</aside>

<style>
	aside {
		display: flex;
		min-height: 0;
		min-width: 0;
		flex-direction: column;
		border-right: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 88%, transparent);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-50, white) 96%, var(--color-primary-500, #2563eb) 4%),
			color-mix(in srgb, var(--color-surface-50, white) 90%, var(--color-surface-100, #f4f4f5) 10%)
		);
	}

	aside > div {
		min-height: 0;
		overflow-y: visible;
		padding: 0.9rem;
	}

	footer {
		flex-shrink: 0;
		padding: 0 0.9rem 0.9rem;
	}

	@media (min-width: 768px) {
		aside > div {
			overflow-y: visible;
		}
	}
</style>
