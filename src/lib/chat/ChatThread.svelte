<!-- src/lib/chat/ChatThread.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	export type $$Slots = {
		default: Record<string, never>;
		actions: Record<string, never>;
	};

	const props = $props<{
		title?: string;
		children?: Snippet;
		actions?: Snippet;
	}>();
</script>

<section>
	<header>
		<h2>
			{props.title ?? 'Thread'}
		</h2>
		<div>
			{@render props.actions?.()}
		</div>
	</header>

	<div>
		<div>
			{@render props.children?.()}
		</div>
	</div>
</section>

<style>
	section {
		display: flex;
		min-height: 0;
		flex-direction: column;
		gap: 0.55rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
	}

	h2 {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		color: color-mix(
			in srgb,
			var(--color-surface-600, #52525b) 78%,
			var(--color-surface-900, #18181b)
		);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	header > div {
		display: flex;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	section > div {
		overflow-y: visible;
	}

	section > div > div {
		padding: 0;
	}

	@media (min-width: 768px) {
		section {
			flex: 1;
		}

		section > div {
			overflow-y: visible;
		}
	}

	@media (min-width: 768px) and (max-width: 900px) {
		header {
			align-items: stretch;
			flex-direction: column;
			gap: 0.55rem;
		}

		header > div {
			width: 100%;
		}

		header > div :global(button) {
			width: 100%;
		}
	}
</style>
