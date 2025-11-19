<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}>();
</script>

<button
	type={props.type ?? 'button'}
	disabled={props.disabled ?? false}
	onclick={props.onclick}
	data-variant={props.variant ?? 'primary'}
	data-size={props.size ?? 'md'}
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
		border-radius: 9999px; /* pill shape */
		font-weight: 600;
		line-height: 1;
		font-family: inherit;
		transition: all 150ms ease;
		text-decoration: none;
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
		color: white; /* Assuming white text for primary */
	}
	button[data-variant='primary']:hover {
		filter: brightness(1.1);
	}

	button[data-variant='secondary'] {
		background-color: transparent;
		border: 1px solid var(--surface-300);
		color: var(--surface-900);
	}
	button[data-variant='secondary']:hover {
		background-color: var(--surface-100);
	}

	button[data-variant='ghost'] {
		background-color: transparent;
		color: var(--surface-900);
	}
	button[data-variant='ghost']:hover {
		background-color: var(--surface-100);
	}
</style>
