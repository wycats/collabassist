<script lang="ts">
	import CardOptionList, { type CardOption } from '$lib/cards/CardOptionList.svelte';
	import CardShell from '$lib/cards/CardShell.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { ProposeCard as ProposeCardSpec, ProposeOption } from '$lib/cards/types';

	type Props = {
		message: CardMessage<ProposeCardSpec>;
		onSubmit?: (detail: Record<string, unknown>) => void;
		onRefine?: () => void;
		onFork?: () => void;
	};

	let { message, onSubmit, onRefine, onFork }: Props = $props();

	const card = message.spec;

	function chooseOption(option: CardOption) {
		if (!onSubmit) return;
		onSubmit({ messageId: message.id, option: option as ProposeOption });
	}
</script>

<CardShell
	title={card.title}
	description={card.description}
	onRefine={onRefine}
	onFork={onFork}
>
	<CardOptionList
		options={card.options}
		onSelect={chooseOption}
		showToken
	/>
</CardShell>
