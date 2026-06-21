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
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 58%, transparent);
		border-radius: 0.62rem;
		background: color-mix(in srgb, var(--color-surface-50, oklch(0.99 0 0)) 94%, transparent);
		list-style: none;
	}

	li + li {
		border-top: 1px solid
			color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 52%, transparent);
	}

	button {
		display: flex;
		align-items: flex-start;
		width: 100%;
		gap: 0.58rem;
		border: 0;
		background: transparent;
		padding: 0.62rem 0.68rem;
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	button:hover,
	button:focus-visible {
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 6%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
		color: var(--color-surface-900, oklch(0.25 0 0));
		outline: none;
	}

	button[data-selected='true'] {
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 8%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
	}

	.token-wrapper {
		display: flex;
		flex-shrink: 0;
		padding-top: 0.05rem;
	}

	button > span {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	strong {
		font-size: 0.84rem;
		font-weight: 650;
		line-height: 1.2;
		color: inherit;
	}

	small {
		font-size: 0.77rem;
		line-height: 1.34;
		color: color-mix(
			in lab,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}

	@media (min-width: 768px) {
		ul {
			border-radius: 0.56rem;
		}

		button {
			padding: 0.5rem 0.56rem;
		}

		button > span {
			gap: 0.1rem;
		}

		strong {
			font-size: 0.81rem;
		}

		small {
			font-size: 0.73rem;
			line-height: 1.3;
		}
	}
</style>
