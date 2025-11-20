<script lang="ts">
	import type { AnyCard } from '$lib/cards/types';
	import Button from '$lib/ui/Button.svelte';

	let { card, onClose, onApply }: { card: AnyCard; onClose: () => void; onApply: (instructions: string) => void } = $props();

	let instructions = $state('');
</script>

<aside
	class="flex h-full w-80 flex-col border-l border-surface-200-800/50 bg-surface-50-900 transition-all"
>
	<header class="flex items-center justify-between border-b border-surface-200-800/50 px-4 py-3">
		<h3 class="text-sm font-semibold text-surface-900-100">Refine</h3>
		<Button variant="ghost" size="sm" onclick={onClose} class="!p-1 w-6 h-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="w-4 h-4"
			>
				<path
					d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
				/>
			</svg>
		</Button>
	</header>

	<div class="flex-1 overflow-y-auto p-4">
		<div class="mb-4">
			<h4 class="mb-1 text-xs font-medium uppercase tracking-wider text-surface-500-400">
				Target
			</h4>
			<div class="rounded-lg border border-surface-200-800 bg-surface-100-800 p-3">
				<p class="font-medium text-sm text-surface-900-50">{card.title}</p>
				{#if card.description}
					<p class="mt-1 text-xs text-surface-600-300">{card.description}</p>
				{/if}
			</div>
		</div>

		<div class="space-y-4">
			<div>
				<label for="refine-instructions" class="mb-1 block text-xs font-medium text-surface-700-200">
					Instructions
				</label>
				<textarea
					id="refine-instructions"
					class="w-full rounded-lg border border-surface-300-600 bg-transparent px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
					rows="4"
					placeholder="How should this be changed?"
					bind:value={instructions}
				></textarea>
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
