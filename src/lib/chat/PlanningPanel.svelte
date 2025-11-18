<script lang="ts">
	import { currentPlan } from '$lib/domain/planning-store';
	import { getOptionToken } from '$lib/domain/option-token';
	import OptionToken from '$lib/ui/OptionToken.svelte';

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
			<p class="text-surface-500-300 flex items-center gap-1 text-[10px] tracking-wide uppercase">
				{#if $currentPlan.interpret}
					{@const token = getOptionToken($currentPlan.interpret.id)}
					<OptionToken {token} size="sm" />
				{/if}
				<span>Intent</span>
			</p>
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
			<p class="text-surface-500-300 flex items-center gap-1 text-[10px] tracking-wide uppercase">
				{#if $currentPlan.propose}
					{@const token = getOptionToken($currentPlan.propose.id)}
					<OptionToken {token} size="sm" />
				{/if}
				<span>Path</span>
			</p>
			{#if $currentPlan.propose}
				<p class="text-surface-900-50 font-medium">{$currentPlan.propose.label}</p>
				{#if renderSummary($currentPlan.propose.summary)}
					<p class="text-surface-600-200 text-xs">{$currentPlan.propose.summary}</p>
				{/if}
			{:else}
				<p class="text-surface-500-300 text-xs">Choose a proposal to lock the path.</p>
			{/if}
		</div>
	</div>
</section>
