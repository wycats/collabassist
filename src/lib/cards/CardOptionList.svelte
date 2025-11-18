<script lang="ts">
	import { getOptionToken } from '$lib/domain/option-token';
	import OptionToken from '$lib/ui/OptionToken.svelte';

	export type CardOption = {
		id: string;
		label: string;
		summary?: string;
	};

	const props = $props<{
		options: CardOption[];
		onSelect?: (option: CardOption) => void;
		// Optional: show a small token (shape+color) before each label.
		showToken?: boolean;
		selectedId?: string;
	}>();

	function handleSelect(option: CardOption) {
		props.onSelect?.(option);
	}
</script>

<ul class="option-list" role="list">
	{#each props.options as option (option.id)}
		<li>
			<button
				type="button"
				class="option {option.id === props.selectedId ? 'option--selected' : ''}"
				onclick={() => handleSelect(option)}
			>
				{#if props.showToken}
					{@const token = getOptionToken(option.id)}
					<OptionToken {token} size="sm" class="option__token" />
				{/if}
				<span class="option__label">{option.label}</span>
				{#if option.summary}
					<span class="option__summary">{option.summary}</span>
				{/if}
			</button>
		</li>
	{/each}
</ul>

<style>
	.option-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option {
		width: 100%;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 60%, transparent);
		background: color-mix(in srgb, var(--color-surface-50, oklch(0.99 0 0)) 85%, transparent);
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background 120ms ease;
	}

	.option__token {
		flex-shrink: 0;
	}

	.option:hover,
	.option:focus-visible {
		border-color: var(--color-primary-500, oklch(0.57 0.21 258.29));
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 8%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
		outline: none;
	}

	.option--selected {
		border-color: var(--color-primary-500, oklch(0.57 0.21 258.29));
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 12%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
	}

	.option__label {
		display: block;
		font-weight: 500;
	}

	.option__summary {
		display: block;
		font-size: 0.85rem;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
		margin-top: 0.15rem;
	}
</style>
