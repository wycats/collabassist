<!-- src/lib/cards/ChoiceCard.svelte -->
<script lang="ts">
	import CardShell from '$lib/cards/CardShell.svelte';
	import Button from '$lib/ui/Button.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { ChoiceCardSpec, ChoiceOption } from '$lib/domain/card';

	const props = $props<{
		message: CardMessage<ChoiceCardSpec>;
		onSubmit?: (payload: { messageId: string; choice: ChoiceOption }) => void;
	}>();

	let selectedId = $state<string | undefined>();

	function selectOption(optionId: string) {
		selectedId = optionId;
	}

	function handleSubmit() {
		if (!selectedId) return;
		const choice = props.message.spec.options.find(
			(option: ChoiceOption) => option.id === selectedId
		);
		if (!choice) return;

		(props.onSubmit ?? (() => {}))({
			messageId: props.message.id,
			choice
		});
	}
</script>

<CardShell title={props.message.spec.prompt}>
	<ul class="choice-list" role="list">
		{#each props.message.spec.options as option (option.id)}
			<li>
				<button
					type="button"
					class="choice"
					data-selected={selectedId === option.id ? 'true' : undefined}
					aria-pressed={selectedId === option.id}
					onclick={() => selectOption(option.id)}
				>
					<span class="label">{option.label}</span>
					{#if option.description}
						<span class="description">{option.description}</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>

	<div class="actions">
		<Button variant="primary" onclick={handleSubmit} disabled={!selectedId}>Confirm</Button>
	</div>
</CardShell>

<style>
	.choice-list {
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.choice-list li {
		list-style: none;
	}

	.choice {
		width: 100%;
		text-align: left;
		border: 1px solid color-mix(in lab, var(--surface-400) 60%, transparent);
		border-radius: 0.85rem;
		padding: 0.75rem 0.9rem;
		background: color-mix(in lab, var(--surface-50) 80%, transparent);
		transition:
			border-color 120ms ease,
			background 120ms ease;
		cursor: pointer;
	}

	.choice[data-selected='true'] {
		border-color: var(--primary-500);
		background: color-mix(in lab, var(--primary-500) 12%, var(--surface-50));
	}

	.choice:focus-visible {
		outline: 2px solid var(--primary-500);
		outline-offset: 2px;
	}

	.label {
		display: block;
		font-weight: 600;
		color: var(--surface-900);
	}

	.description {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.85rem;
		color: color-mix(in lab, var(--surface-600) 65%, var(--surface-900));
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.75rem;
	}
</style>
