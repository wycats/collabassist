<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, footer }: { children: Snippet; footer?: Snippet } = $props();
</script>

<aside class="flex h-full flex-col border-r border-surface-200-800 bg-surface-50-900">
	<div class="flex-1 overflow-y-auto p-4">
		{@render children()}
	</div>
	{#if footer}
		<div class="border-t border-surface-200-800 p-4">
			{@render footer()}
		</div>
	{/if}
</aside>
