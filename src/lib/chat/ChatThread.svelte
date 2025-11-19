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

<section class="flex min-h-0 flex-1 flex-col gap-2">
	<div class="flex items-center justify-between">
		<h2 class="text-surface-700-200 text-xs font-semibold tracking-wide uppercase">
			{props.title ?? 'Thread'}
		</h2>
		<div class="flex gap-2 text-xs">
			{@render props.actions?.()}
		</div>
	</div>

	<div
		class="variant-soft-surface h-full max-h-[calc(100vh-220px)] min-h-[280px] overflow-y-auto
           card border border-surface-200-800/70 shadow-sm"
	>
		<div class="px-4 py-3">
			{@render props.children?.()}
		</div>
	</div>
</section>
