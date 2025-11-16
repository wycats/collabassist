<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		children?: Snippet;
	}>();
</script>

<button
	type={props.type ?? 'button'}
	disabled={props.disabled ?? false}
	class={`btn ${props.size === 'sm' ? 'btn-sm' : props.size === 'lg' ? 'btn-lg' : 'btn-base'} ${
		props.variant === 'secondary'
			? 'preset-outlined-surface-200-800'
			: props.variant === 'ghost'
				? 'preset-ghost-surface'
				: 'preset-filled-primary-500'
	}`}
>
	{@render props.children?.()}
</button>
