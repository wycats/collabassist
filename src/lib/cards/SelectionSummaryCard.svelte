<script lang="ts">
	import type { CardMessage } from '$lib/domain/message';
	import type { SelectionSummaryCard as SelectionSummaryCardSpec } from '$lib/cards/types';

	type Props = {
		message: CardMessage<SelectionSummaryCardSpec>;
	};

	let { message }: Props = $props();

	let card = $derived(message.spec);
	let phaseLabel = $derived(card.sourceCardKind === 'interpret' ? 'Interpretation' : 'Proposal');
</script>

<section class="summary" aria-label={`${phaseLabel} locked`}>
	<div class="body">
		<p class="line">
			<span class="phase">{phaseLabel} locked:</span>
			<span class="label">{card.selectionLabel}</span>
		</p>
		{#if card.selectionSummary}
			<p class="details">{card.selectionSummary}</p>
		{/if}
	</div>
</section>

<style>
	.summary {
		padding-block: 0.2rem;
		padding-inline: 0.15rem;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.line {
		margin: 0;
		font-size: 0.8rem;
		color: color-mix(
			in lab,
			var(--color-surface-700, oklch(0.4 0 0)) 70%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.phase {
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-right: 0.25rem;
	}

	.label {
		font-weight: 600;
	}

	.details {
		margin: 0;
		font-size: 0.78rem;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}
</style>
