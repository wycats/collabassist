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
		showToken?: boolean;
		selectedId?: string;
	}>();

	function handleSelect(option: CardOption) {
		props.onSelect?.(option);
	}
</script>

<ul role="list">
	{#each props.options as option (option.id)}
		<li>
			<button
				type="button"
				data-selected={option.id === props.selectedId ? 'true' : undefined}
				aria-pressed={option.id === props.selectedId}
				onclick={() => handleSelect(option)}
			>
				{#if props.showToken}
					{@const token = getOptionToken(option.id)}
					<div class="token-wrapper">
						<OptionToken {token} size="sm" />
					</div>
				{/if}
				<span>
					<strong>{option.label}</strong>
					{#if option.summary}
						<small>{option.summary}</small>
					{/if}
				</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
	}

	button {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.55rem;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 52%, transparent);
		border-radius: 0.48rem;
		background: color-mix(in srgb, var(--color-surface-50, oklch(0.99 0 0)) 96%, transparent);
		padding: 0.54rem 0.62rem;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			box-shadow 120ms ease;
	}

	button:hover,
	button:focus-visible {
		border-color: var(--color-primary-500, oklch(0.57 0.21 258.29));
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 8%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
		box-shadow: 0 4px 12px hsl(220 22% 14% / 0.04);
		outline: none;
	}

	button[data-selected='true'] {
		border-color: var(--color-primary-500, oklch(0.57 0.21 258.29));
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 12%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
	}

	.token-wrapper {
		display: flex;
		flex-shrink: 0;
		align-self: flex-start;
		padding-top: 0.02rem;
	}

	button > span {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	strong {
		font-size: 0.86rem;
		font-weight: 650;
		line-height: 1.2;
		color: inherit;
	}

	small {
		font-size: 0.78rem;
		line-height: 1.36;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}
</style>
