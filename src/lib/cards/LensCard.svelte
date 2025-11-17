<script lang="ts">
	import CardShell from '$lib/cards/CardShell.svelte';
	import LensSummary from '$lib/cards/LensSummary.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { LensCard as LensCardSpec } from '$lib/cards/types';

	type Props = {
		message: CardMessage<LensCardSpec>;
	};

	let { message }: Props = $props();

	const card = message.spec;
	const payloadJson = JSON.stringify(card.payload, null, 2);
</script>

<CardShell title={card.title} description={card.description}>
	<LensSummary lensType={card.lensType} payload={card.payload} />
	<details>
		<summary>View JSON</summary>
		<pre>{payloadJson}</pre>
	</details>
</CardShell>

<style>
	details {
		margin-top: 0.75rem;
		font-size: 0.85rem;
		color: var(--sk-color-muted-700);
	}

	summary {
		cursor: pointer;
	}

	pre {
		margin: 0.4rem 0 0;
		padding: 0.7rem;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--sk-color-surface-2) 80%, transparent);
		font-size: 0.78rem;
		max-height: 18rem;
		overflow: auto;
	}
</style>
