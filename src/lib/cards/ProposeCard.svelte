<script lang="ts">
	import CardOptionList, { type CardOption } from '$lib/cards/CardOptionList.svelte';
	import CardShell from '$lib/cards/CardShell.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import { currentPlan } from '$lib/domain/planning-store';
	import type { ProposeCard as ProposeCardSpec, ProposeOption } from '$lib/cards/types';

	type Props = {
		message: CardMessage<ProposeCardSpec>;
		onSubmit?: (payload: { messageId: string; option: ProposeOption }) => void;
	};

	let { message, onSubmit }: Props = $props();

	const card = message.spec;

	function chooseOption(option: CardOption) {
		if (!onSubmit) return;
		onSubmit({ messageId: message.id, option: option as ProposeOption });
	}
</script>

<CardShell title={card.title} description={card.description}>
	<CardOptionList
		options={card.options}
		onSelect={chooseOption}
		showToken
		selectedId={$currentPlan.propose?.id}
	/>
</CardShell>
