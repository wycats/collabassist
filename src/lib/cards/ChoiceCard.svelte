<!-- src/lib/cards/ChoiceCard.svelte -->
<script lang="ts">
	import type { CardMessage } from '$lib/domain/message';
	import type { ChoiceCardSpec, ChoiceOption } from '$lib/domain/card';
	import { RadioGroup } from 'bits-ui';
	import Button from '$lib/ui/Button.svelte';

	const props = $props<{
		message: CardMessage<ChoiceCardSpec>;
		onSubmit?: (payload: { messageId: string; choice: ChoiceOption }) => void;
	}>();

	let selectedId = $state<string | null>(null);

	function handleSubmit() {
		if (!selectedId) return;
		const choice = props.message.spec.options.find((o) => o.id === selectedId);
		if (!choice) return;

		(props.onSubmit ?? (() => {}))({
			messageId: props.message.id,
			choice
		});
	}
</script>

<div class="space-y-3 rounded-container border border-surface-200-800 bg-surface-100-900 p-3">
	<div>
		<p class="text-surface-600-300 mb-1 text-xs font-semibold tracking-wide uppercase">Choice</p>
		<p class="text-surface-900-50 text-sm">
			{props.message.spec.prompt}
		</p>
	</div>

	<RadioGroup.Root class="space-y-2" bind:value={selectedId} aria-label={props.message.spec.prompt}>
		{#each props.message.spec.options as option (option.id)}
			<RadioGroup.Item
				value={option.id}
				class="flex cursor-pointer items-start gap-2 rounded-container border
               border-surface-300-700 px-3 py-2 data-[state=checked]:border-primary-500
               data-[state=checked]:bg-primary-500/5"
			>
				<RadioGroup.Input class="sr-only" />
				<RadioGroup.Control
					class="mt-1 flex h-4 w-4 items-center justify-center
                 rounded-full border border-surface-400-600
                 data-[state=checked]:border-primary-500
                 data-[state=checked]:bg-primary-500"
				>
					<div class="h-2 w-2 rounded-full bg-surface-50" />
				</RadioGroup.Control>
				<div class="flex-1">
					<div class="text-sm font-medium">{option.label}</div>
					{#if option.description}
						<div class="text-surface-600-300 mt-0.5 text-xs">
							{option.description}
						</div>
					{/if}
				</div>
			</RadioGroup.Item>
		{/each}
	</RadioGroup.Root>

	<div class="flex justify-end pt-1">
		<Button variant="primary" on:click={handleSubmit} disabled={!selectedId}>Confirm</Button>
	</div>
</div>

<style>
	.rounded-container {
		@apply rounded-lg;
	}
</style>
