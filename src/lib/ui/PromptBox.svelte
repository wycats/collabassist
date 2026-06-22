<script lang="ts">
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (!disabled && value.trim()) {
				onsubmit?.();
			}
		}
	}
</script>

<textarea
	bind:value
	{placeholder}
	{disabled}
	rows="1"
	aria-label={placeholder}
	onkeydown={handleKeydown}></textarea>

<style>
	textarea {
		field-sizing: content;
		width: 100%;
		min-height: 1.5em;
		max-height: 15rem;
		resize: none;
		overflow-y: auto;
		border: 0;
		border-color: transparent;
		padding: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		line-height: 1.5;
		outline: none;
		box-shadow: none;
	}

	textarea:focus,
	textarea:focus-visible {
		border-color: transparent;
		outline: none;
		box-shadow: none;
		--tw-ring-color: transparent;
		--tw-ring-shadow: 0 0 #0000;
	}

	textarea::placeholder {
		color: var(--color-surface-400, oklch(0.7 0 0));
	}
</style>
