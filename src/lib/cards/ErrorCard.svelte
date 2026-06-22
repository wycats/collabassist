<script lang="ts">
	import CardShell from '$lib/cards/CardShell.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { ErrorCard as ErrorCardSpec } from '$lib/cards/types';

	type Props = {
		message: CardMessage<ErrorCardSpec>;
		onRefine?: () => void;
		onFork?: () => void;
	};

	let { message, onRefine, onFork }: Props = $props();

	let card = $derived(message.spec);
</script>

<CardShell title={card.title} description={card.description} {onRefine} {onFork}>
	<section aria-label="Recovery details">
		<p data-kind="error">{card.errorKind.replace('_', ' ')}</p>
		{#if card.details}
			<p>{card.details}</p>
		{/if}
		{#if card.recoveryHint}
			<p data-kind="hint">{card.recoveryHint}</p>
		{/if}
	</section>
</CardShell>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.75rem;
		border-radius: 0.6rem;
		border: 1px solid color-mix(in srgb, var(--color-primary-500) 35%, transparent);
		background: color-mix(in srgb, var(--color-primary-500) 8%, var(--color-surface-50));
	}

	p {
		margin: 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--color-surface-700) 80%, var(--color-surface-900));
	}

	p[data-kind='error'] {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-primary-600, var(--color-primary-500));
	}

	p[data-kind='hint'] {
		font-weight: 600;
	}
</style>
