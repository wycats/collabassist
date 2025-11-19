<script lang="ts">
	import LensSummary from '$lib/cards/LensSummary.svelte';
	import MockupRegions from '$lib/cards/MockupRegions.svelte';
	import { currentPlan } from '$lib/domain/planning-store';

	function renderSummary(summary?: string) {
		return summary ? summary : undefined;
	}
</script>

{#if $currentPlan.inspect}
	<section
		class="variant-soft-surface card border border-surface-200-800/70 shadow-sm"
		aria-live="polite"
	>
		<div
			class="flex items-center justify-between gap-2 border-b border-surface-200-800/50 px-4 py-3"
		>
			<div class="flex flex-col">
				<span class="text-surface-500-300 text-[11px] tracking-wide uppercase">Artifact</span>
				<h3 class="text-sm font-semibold text-surface-900-100">Inspect artifact</h3>
			</div>
			<span class="badge">{$currentPlan.inspect.kind}</span>
		</div>

		<div class="space-y-3 px-4 py-4 text-sm">
			<p class="text-surface-900-50 font-medium">{$currentPlan.inspect.label}</p>
			{#if renderSummary($currentPlan.inspect.summary)}
				<p class="text-surface-600-200 text-xs">{$currentPlan.inspect.summary}</p>
			{/if}

			{#if $currentPlan.inspect.kind === 'mockup'}
				<div class="artifact-stack">
					<MockupRegions regions={$currentPlan.inspect.card.regions} />
					<details>
						<summary>View JSON</summary>
						<pre>{JSON.stringify($currentPlan.inspect.card.regions, null, 2)}</pre>
					</details>
				</div>
			{:else}
				<div class="artifact-stack">
					<LensSummary
						lensType={$currentPlan.inspect.card.lensType}
						payload={$currentPlan.inspect.card.payload}
					/>
					<details>
						<summary>View JSON</summary>
						<pre>{JSON.stringify($currentPlan.inspect.card.payload, null, 2)}</pre>
					</details>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<section
		class="variant-soft-surface bg-surface-50-900/10 text-surface-500-300 card border border-dashed border-surface-200-800/60 text-center text-sm"
	>
		<div class="px-4 py-8">
			<p class="text-[11px] tracking-wide uppercase">Inspect artifact</p>
			<p class="mt-1 text-sm font-medium">None pinned yet</p>
			<p class="mt-1 text-xs">Choose a proposal to generate an inspect artifact.</p>
		</div>
	</section>
{/if}

<style>
	.badge {
		border-radius: 999px;
		padding: 0.15rem 0.8rem;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		background: color-mix(in srgb, var(--color-surface-900, oklch(0.25 0 0)) 12%, transparent);
		color: color-mix(
			in srgb,
			var(--color-surface-50, oklch(0.99 0 0)) 85%,
			var(--color-surface-200, oklch(0.81 0 0))
		);
	}

	.artifact-stack {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.artifact-stack details {
		font-size: 0.78rem;
		color: color-mix(
			in srgb,
			var(--color-surface-600, oklch(0.45 0 0)) 60%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}

	.artifact-stack summary {
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.7rem;
	}

	.artifact-stack pre {
		margin: 0.25rem 0 0;
		padding: 0.6rem;
		max-height: 16rem;
		overflow: auto;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--color-surface-100, oklch(0.91 0 0)) 70%, transparent);
		font-size: 0.75rem;
		line-height: 1.3;
	}
</style>
