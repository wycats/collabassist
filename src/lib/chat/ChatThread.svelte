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
		min-height: 8.5rem;
		overflow-y: visible;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 70%, transparent);
		border-radius: 0.78rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 84%, transparent);
		box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.72);
	}

	section > div > div {
		padding: 0.75rem;
	}

	@media (min-width: 768px) {
		section {
			flex: 1;
		}

		section > div {
			max-height: calc(100dvh - 230px);
			min-height: clamp(11.5rem, 30vh, 16rem);
			overflow-y: auto;
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
