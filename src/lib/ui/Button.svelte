<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		'aria-label'?: string;
		title?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	}>();
</script>

<button
	type={props.type ?? 'button'}
	disabled={props.disabled ?? false}
	aria-label={props['aria-label']}
	title={props.title}
	onclick={props.onclick}
	data-variant={props.variant ?? 'primary'}
	data-size={props.size ?? 'md'}
	class={props.class}
>
	{@render props.children?.()}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		border: none;
		border-radius: 9999px;
		font-weight: 600;
		line-height: 1;
		font-family: inherit;
		transition:
			background 150ms ease,
			border-color 150ms ease,
			color 150ms ease,
			box-shadow 150ms ease,
			transform 150ms ease;
		text-decoration: none;
	}

	button:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-primary-500) 70%, white);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Sizes */
	button[data-size='sm'] {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	button[data-size='md'] {
		padding: 0.625rem 1.25rem;
		font-size: 1rem;
	}

	button[data-size='lg'] {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
	}

	/* Variants */
	button[data-variant='primary'] {
		background-color: var(--color-primary-500);
		color: white;
		box-shadow: 0 1px 2px hsl(220 28% 12% / 0.14);
	}
	button[data-variant='primary']:hover {
		background-color: color-mix(in srgb, var(--color-primary-500) 92%, white);
		box-shadow: 0 6px 16px hsl(220 28% 12% / 0.12);
		transform: translateY(-1px);
	}

	button[data-variant='secondary'] {
		background-color: color-mix(in srgb, var(--color-surface-50, white) 86%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-surface-300, #d4d4d8) 72%, transparent);
		color: var(--color-surface-900);
		box-shadow: 0 1px 2px hsl(220 20% 20% / 0.04);
	}
	button[data-variant='secondary']:hover {
		background-color: var(--color-surface-100);
		border-color: color-mix(in srgb, var(--color-surface-400, #a1a1aa) 70%, transparent);
	}

	button[data-variant='ghost'] {
		background-color: transparent;
		color: var(--color-surface-900);
	}
	button[data-variant='ghost']:hover {
		background-color: var(--color-surface-100);
	}
</style>
