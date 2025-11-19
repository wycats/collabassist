<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		title: string;
		description?: string;
		children?: Snippet;
	}>();
</script>

<section aria-live="polite">
	<header>
		<h3>{props.title}</h3>
		{#if props.description}
			<p>{props.description}</p>
		{/if}
	</header>

	<div>
		{@render props.children?.()}
	</div>
</section>

<style>
	section {
		border: 1px solid color-mix(in lab, var(--surface-400) 40%, transparent);
		border-radius: 0.9rem;
		padding: 1rem;
		background: color-mix(in lab, var(--surface-50) 70%, transparent);
		box-shadow: 0 6px 24px hsl(220 20% 20% / 0.08);
		max-width: 28rem;
	}

	section > header {
		margin-bottom: 0.75rem;
	}

	section > header > h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--surface-900);
	}

	section > header > p {
		margin: 0.35rem 0 0;
		font-size: 0.85rem;
		color: color-mix(in lab, var(--surface-600) 60%, var(--surface-900));
	}

	section > div {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
