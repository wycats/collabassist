<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		title?: string;
		children?: Snippet;
		headerRight?: Snippet;
	}>();
</script>

<div
	class="flex min-h-screen flex-col bg-gradient-to-b from-surface-50-950 to-surface-100-900 font-sans"
>
	<header class="border-b border-surface-200-800/70 bg-surface-50/80 backdrop-blur">
		<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
			<h1 class="text-sm font-semibold tracking-tight">
				{props.title ?? 'AI Client – Interaction Playground'}
			</h1>
			<div class="text-surface-600-300 flex items-center gap-2 text-[11px]">
				{@render props.headerRight?.()}
			</div>
		</div>
	</header>

	<main class="flex-1">
		<div class="mx-auto flex h-full max-w-5xl flex-col gap-4 px-4 py-4">
			{@render props.children?.()}
		</div>
	</main>
</div>
