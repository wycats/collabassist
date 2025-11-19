<script lang="ts">
	import type { OptionToken } from '$lib/domain/option-token';

	const props = $props<{
		token: OptionToken;
		size?: 'sm' | 'md';
		class?: string;
	}>();

	const size = props.size ?? 'md';
</script>

<span class={`option-token ${props.class ?? ''}`} data-size={size} aria-hidden="true">
	<span class="dot"></span>
	<span class="code">{props.token.code}</span>
</span>

<style>
	.option-token {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		font-size: 0.7rem;
		color: color-mix(
			in lab,
			var(--color-surface-700, oklch(0.4 0 0)) 70%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}

	.option-token[data-size='sm'],
	.option-token[data-size='md'] {
		/* Tokens are inline; size variants reserved for future differences. */
	}

	.dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
		background: var(--color-surface-700, oklch(0.4 0 0));
	}

	.code {
		font-weight: 600;
		letter-spacing: 0.04em;
	}
</style>
