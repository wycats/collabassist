<script lang="ts">
	import CardShell from '$lib/cards/CardShell.svelte';
	import LensSummary from '$lib/cards/LensSummary.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { LensCard as LensCardSpec } from '$lib/cards/types';

	type Props = {
		message: CardMessage<LensCardSpec>;
		onSubmit?: (detail: Record<string, unknown>) => void;
		onRefine?: () => void;
		onFork?: () => void;
	};

	let { message, onRefine, onFork }: Props = $props();

	const card = message.spec;
	const payloadJson = JSON.stringify(card.payload, null, 2);
</script>

<CardShell
	title={card.title}
	description={card.description}
	onRefine={onRefine}
	onFork={onFork}
>
	<LensSummary lensType={card.lensType} payload={card.payload} />
	<details>
		<summary>View JSON</summary>
		<pre>{payloadJson}</pre>
	</details>
</CardShell>

<style>
	details {
		margin-top: 0.75rem;
		color: color-mix(
			in srgb,
			var(--color-surface-600, oklch(0.45 0 0)) 70%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}

	summary {
		cursor: pointer;
	}

	pre {
		margin: 0.4rem 0 0;
		padding: 0.7rem;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--color-surface-100, oklch(0.96 0 0)) 80%, transparent);
		font-size: 0.78rem;
		max-height: 18rem;
		overflow: auto;
	}
</style>
