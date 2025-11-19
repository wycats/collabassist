<script lang="ts">
	import { type Snippet } from 'svelte';

	let { children, onSubmit }: { children: Snippet; onSubmit: () => void } = $props();
</script>

<section class="mt-2 border-t border-surface-200-800/70 pt-4 pb-2">
	<div class="relative flex items-end gap-2 rounded-3xl border border-surface-300-700 bg-surface-50-950 p-2 shadow-sm transition-colors focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50">
		<div class="flex-1 min-w-0 py-1.5 px-2">
			{@render children()}
		</div>
	</div>
</section>
