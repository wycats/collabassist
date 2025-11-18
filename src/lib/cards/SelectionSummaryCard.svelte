<script lang="ts">
	import type { CardMessage } from '$lib/domain/message';
	import type { SelectionSummaryCard as SelectionSummaryCardSpec } from '$lib/cards/types';
	import { getOptionToken } from '$lib/domain/option-token';
	import OptionToken from '$lib/ui/OptionToken.svelte';

	type Props = {
		message: CardMessage<SelectionSummaryCardSpec>;
	};

	let { message }: Props = $props();

	const card = message.spec;
	const phaseLabel = card.sourceCardKind === 'interpret' ? 'Interpretation' : 'Proposal';
	const token = getOptionToken(card.selectionId);
</script>

<!-- Hybrid variant: vertical dot + compact arrow line

 - Dot + rail on the left keep this feeling like a lightweight
   timeline/activity marker.
 - The inline arrow + label stays compact enough to fit on one
   or two lines, with an optional second summary line.
-->
<section class="summary" aria-label={`${phaseLabel} locked`}>
	<div class="summary__rail" aria-hidden="true">
		<div class="summary__rail-line"></div>
		<div class="summary__token">
			<OptionToken {token} size="sm" />
		</div>
	</div>
	<div class="summary__body">
		<p class="summary__line">
			<span class="summary__phase">{phaseLabel} locked:</span>
			<span class="summary__label">{card.selectionLabel}</span>
		</p>
		{#if card.selectionSummary}
			<p class="summary__details">{card.selectionSummary}</p>
		{/if}
	</div>
</section>

<style>
	.summary {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		column-gap: 0.75rem;
		padding-block: 0.25rem;
	}

	.summary__rail {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-inline-start: 0.5rem;
	}

	.summary__rail-line {
		position: absolute;
		inset-block: 0;
		left: 50%;
		width: 1px;
		transform: translateX(-50%);
		background: color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 70%, transparent);
	}

	.summary__token {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.summary__body {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.summary__line {
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

	.summary__phase {
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-right: 0.25rem;
	}

	.summary__label {
		font-weight: 600;
	}

	.summary__details {
		margin: 0;
		font-size: 0.78rem;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}
</style>
