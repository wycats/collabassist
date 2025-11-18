<script lang="ts">
	import CardOptionList, { type CardOption } from '$lib/cards/CardOptionList.svelte';
	import CardShell from '$lib/cards/CardShell.svelte';
	import { currentPlan } from '$lib/domain/planning-store';
	import type { CardMessage } from '$lib/domain/message';
	import type { InterpretCard as InterpretCardSpec, InterpretOption } from '$lib/cards/types';

	const props = $props<{
		message: CardMessage<InterpretCardSpec>;
		onSubmit?: (payload: { messageId: string; option: InterpretOption }) => void;
	}>();

	function selectOption(option: CardOption) {
		props.onSubmit?.({ messageId: props.message.id, option: option as InterpretOption });
	}
</script>

<CardShell title={props.message.spec.title} description={props.message.spec.description}>
	<CardOptionList
		options={props.message.spec.options}
		onSelect={selectOption}
		showToken
		selectedId={$currentPlan.interpret?.id}
	/>
</CardShell>
