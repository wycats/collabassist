<script lang="ts">
	import type { OptionToken } from '$lib/domain/option-token';

	const props = $props<{
		token: OptionToken;
		size?: 'sm' | 'md';
		class?: string;
	}>();

	let size = $derived(props.size ?? 'md');
</script>

<span class={`option-token ${props.class ?? ''}`} data-size={size} aria-hidden="true">
	<span class="code">{props.token.code}</span>
</span>

<style>
	.option-token {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border: 1px solid
			color-mix(in srgb, var(--color-primary-500, oklch(0.57 0.21 258.29)) 12%, transparent);
		border-radius: 0.34rem;
		background: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 7%,
			var(--color-surface-50, oklch(0.99 0 0))
		);
		font-size: 0.68rem;
		color: color-mix(
			in srgb,
			var(--color-primary-500, oklch(0.57 0.21 258.29)) 68%,
			var(--color-surface-700, oklch(0.4 0 0))
		);
	}

	.option-token[data-size='sm'] {
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 0.3rem;
		font-size: 0.64rem;
	}

	.code {
		font-weight: 700;
		line-height: 1;
	}
</style>
