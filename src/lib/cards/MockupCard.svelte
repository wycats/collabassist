<script lang="ts">
	import CardShell from '$lib/cards/CardShell.svelte';
	import MockupRegions from '$lib/cards/MockupRegions.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { MockupCard as MockupCardSpec } from '$lib/cards/types';

	type Props = {
		message: CardMessage<MockupCardSpec>;
		onSubmit?: (detail: Record<string, unknown>) => void;
		onRefine?: () => void;
		onFork?: () => void;
	};

	let { message, onRefine, onFork }: Props = $props();

	const card = message.spec;
	const regionsJson = JSON.stringify(card.regions, null, 2);
</script>

<CardShell
	title={card.title}
	description={card.description}
	onRefine={onRefine}
	onFork={onFork}
>
	<MockupRegions regions={card.regions} />

	<details>
		<summary>View JSON</summary>
		<pre>{regionsJson}</pre>
	</details>
</CardShell>

<style>
	details {
		margin-top: 0.85rem;
		font-size: 0.85rem;
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
		margin: 0.5rem 0 0;
		padding: 0.75rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--color-surface-100, oklch(0.96 0 0)) 80%, transparent);
		font-size: 0.75rem;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
