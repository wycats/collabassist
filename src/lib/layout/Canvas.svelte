<script lang="ts">
	import type { Snippet } from 'svelte';

	let { rail, children }: { rail: Snippet; children: Snippet } = $props();
</script>

<main class="flex h-full flex-col bg-surface-50-900">
	<header class="border-b border-surface-200-800 bg-surface-50-900 p-4">
		{@render rail()}
	</header>
	<div class="flex-1 overflow-y-auto p-6">
		{@render children()}
	</div>
</main>
