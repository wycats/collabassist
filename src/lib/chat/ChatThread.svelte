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
		flex: 1;
		flex-direction: column;
		gap: 0.65rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
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
		height: 100%;
		max-height: calc(100vh - 230px);
		min-height: 280px;
		overflow-y: auto;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 78%, transparent);
		border-radius: 0.85rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 78%, transparent);
		box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.72);
	}

	section > div > div {
		padding: 0.9rem;
	}
</style>
