<script lang="ts">
	import MockupRegions from '$lib/cards/MockupRegions.svelte';
	import { currentPlan } from '$lib/domain/planning-store';

	const props = $props<{ title?: string }>();

	function renderSummary(summary?: string) {
		return summary ? summary : undefined;
	}
</script>

<section
	class="variant-soft-surface card border border-surface-200-800/70 shadow-sm"
	aria-live="polite"
>
	<div class="flex items-center justify-between gap-2 border-b border-surface-200-800/50 px-4 py-3">
		<div class="flex flex-col">
			<span class="text-surface-500-300 text-[11px] tracking-wide uppercase">Planning</span>
			<h3 class="text-sm font-semibold text-surface-900-100">
				{props.title ?? 'Pinned plan'}
			</h3>
		</div>
		<span class="text-surface-600-300 text-[11px] font-medium tracking-wide uppercase">
			{$currentPlan.phase}
		</span>
	</div>

	<div class="space-y-4 px-4 py-4 text-sm">
		<div>
			<p class="text-surface-500-300 text-[10px] tracking-wide uppercase">Intent</p>
			{#if $currentPlan.interpret}
				<p class="text-surface-900-50 font-medium">{$currentPlan.interpret.label}</p>
				{#if renderSummary($currentPlan.interpret.summary)}
					<p class="text-surface-600-200 text-xs">{$currentPlan.interpret.summary}</p>
				{/if}
			{:else}
				<p class="text-surface-500-300 text-xs">Waiting for interpretation.</p>
			{/if}
		</div>

		<div>
			<p class="text-surface-500-300 text-[10px] tracking-wide uppercase">Path</p>
			{#if $currentPlan.propose}
				<p class="text-surface-900-50 font-medium">{$currentPlan.propose.label}</p>
				{#if renderSummary($currentPlan.propose.summary)}
					<p class="text-surface-600-200 text-xs">{$currentPlan.propose.summary}</p>
				{/if}
			{:else}
				<p class="text-surface-500-300 text-xs">Choose a proposal to lock the path.</p>
			{/if}
		</div>

		<div>
			<p class="text-surface-500-300 text-[10px] tracking-wide uppercase">Inspect</p>
			{#if $currentPlan.inspect}
				<p class="text-surface-900-50 font-medium">
					<span
						class="rounded bg-surface-200-800 px-1.5 py-0.5 text-[10px] tracking-wide uppercase"
					>
						{$currentPlan.inspect.kind}
					</span>
					{$currentPlan.inspect.label}
				</p>
				{#if renderSummary($currentPlan.inspect.summary)}
					<p class="text-surface-600-200 text-xs">{$currentPlan.inspect.summary}</p>
				{/if}
				{#if $currentPlan.inspect.kind === 'mockup'}
					<div class="mt-3 space-y-3">
						<MockupRegions regions={$currentPlan.inspect.card.regions} variant="compact" />
						<details class="text-surface-600-200 text-xs">
							<summary class="cursor-pointer text-[11px] font-medium tracking-wide uppercase">
								View JSON
							</summary>
							<pre
								class="mt-1 max-h-48 overflow-auto rounded bg-surface-200-800/40 p-2 text-[11px] leading-relaxed"
							>
								{JSON.stringify($currentPlan.inspect.card.regions, null, 2)}
							</pre>
						</details>
					</div>
				{/if}
			{:else}
				<p class="text-surface-500-300 text-xs">Inspect artifact pending.</p>
			{/if}
		</div>
	</div>
</section>
