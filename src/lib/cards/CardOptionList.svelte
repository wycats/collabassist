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
		gap: 0.5rem;
	}

	button {
		width: 100%;
		text-align: left;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.62rem 0.72rem;
		border-radius: 0.5rem;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 60%, transparent);
		background: color-mix(in srgb, var(--color-surface-50, oklch(0.99 0 0)) 92%, transparent);
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background 120ms ease,
			box-shadow 120ms ease,
			transform 120ms ease;
		font-family: inherit;
	}

	button:hover,
	button:focus-visible {
		border-color: var(--color-primary-500, oklch(0.57 0.21 258.29));
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 8%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
		box-shadow: 0 6px 16px hsl(220 22% 14% / 0.06);
		transform: translateY(-1px);
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
		flex-shrink: 0;
		display: flex; /* Ensure token is centered if needed */
	}

	button > span {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	strong {
		font-weight: 650;
		color: inherit;
		line-height: 1.2;
	}

	small {
		font-size: 0.85rem;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}
</style>
