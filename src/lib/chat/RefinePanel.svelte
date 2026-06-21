<script lang="ts">
	import type { AnyCard } from '$lib/cards/types';
	import Button from '$lib/ui/Button.svelte';

	let {
		card,
		onClose,
		onApply
	}: { card: AnyCard; onClose: () => void; onApply: (instructions: string) => void } = $props();

	let instructions = $state('');
</script>

<aside
	class="bg-surface-50-900 flex h-full w-80 flex-col border-l border-surface-200-800/50 transition-all"
>
	<header class="flex items-center justify-between border-b border-surface-200-800/50 px-4 py-3">
		<h3 class="text-sm font-semibold text-surface-900-100">Refine</h3>
		<Button variant="ghost" size="sm" onclick={onClose} class="h-6 w-6 !p-1">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-4 w-4"
			>
				<path
					d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
				/>
			</svg>
		</Button>
	</header>

	<div class="flex-1 overflow-y-auto p-4">
		<div class="mb-4">
			<h4 class="text-surface-500-400 mb-1 text-xs font-medium tracking-wider uppercase">Target</h4>
			<div class="bg-surface-100-800 rounded-lg border border-surface-200-800 p-3">
				<p class="text-surface-900-50 text-sm font-medium">{card.title}</p>
				{#if card.description}
					<p class="text-surface-600-300 mt-1 text-xs">{card.description}</p>
				{/if}
			</div>
		</div>

		<div class="space-y-4">
			<div>
				<label
					for="refine-instructions"
					class="text-surface-700-200 mb-1 block text-xs font-medium"
				>
					Instructions
				</label>
				<textarea
					id="refine-instructions"
					class="border-surface-300-600 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
					rows="4"
					placeholder="How should this be changed?"
					bind:value={instructions}></textarea>
			</div>

			<Button
				variant="primary"
				class="w-full"
				onclick={() => onApply(instructions)}
				disabled={!instructions.trim()}
			>
				Apply Changes
			</Button>
		</div>
	</div>
</aside>
