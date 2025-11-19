<script lang="ts">
	import { onMount } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = 'Type a message...',
		disabled = false,
		onsubmit
	} = $props<{
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		onsubmit?: () => void;
	}>();

	let editor: HTMLElement;

	function handleInput(e: Event) {
		const target = e.target as HTMLElement;
		value = target.innerText;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (!disabled && value.trim()) {
				onsubmit?.();
			}
		}
	}

	// Sync value changes from outside (e.g. clearing draft)
	$effect(() => {
		if (editor && editor.innerText !== value) {
			editor.innerText = value;
		}
	});
</script>

<div class="relative flex w-full items-center">
	{#if !value}
		<div class="pointer-events-none absolute left-0 top-0 text-surface-400-500 select-none">
			{placeholder}
		</div>
	{/if}
	
	<div
		bind:this={editor}
		contenteditable={!disabled ? "plaintext-only" : "false"}
		role="textbox"
		tabindex="0"
		class="max-h-60 min-h-[1.5em] w-full resize-none overflow-y-auto bg-transparent outline-none empty:before:content-['\u200b']"
		oninput={handleInput}
		onkeydown={handleKeydown}
	></div>
</div>

<style>
	/* Fallback for browsers that don't support plaintext-only */
	[contenteditable]:empty:before {
		content: attr(placeholder);
		color: #9ca3af;
		pointer-events: none;
		display: block; /* For Firefox */
	}
</style>
