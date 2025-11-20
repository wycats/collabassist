<script lang="ts">
	import { decisions } from '$lib/domain/decisions-store';
	import { fade } from 'svelte/transition';

	const activePath = decisions.activePath;
	const heads = decisions.heads;
	const headId = decisions.headId;

	function handleBranchChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		decisions.setHead(select.value);
	}
</script>

<section
	class="variant-soft-surface card border border-surface-200-800/70 shadow-sm"
	aria-live="polite"
>
	<div class="flex flex-col gap-3 border-b border-surface-200-800/50 px-4 py-3">
		<div class="flex items-center justify-between gap-2">
			<div class="flex flex-col">
				<span class="text-surface-500-300 text-[11px] tracking-wide uppercase">Decisions Rail</span>
				<h3 class="text-sm font-semibold text-surface-900-100">
					{$activePath.length} Accepted
				</h3>
			</div>
			{#if $heads.length > 1}
				<select
					class="select select-sm w-auto max-w-[150px] text-xs py-1 px-2 pr-8"
					value={$headId}
					onchange={handleBranchChange}
				>
					{#each $heads as head}
						<option value={head.id}>
							{head.cardSnapshot.title}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-2 px-4 py-4 text-sm">
		{#if $activePath.length === 0}
			<p class="text-surface-500-300 text-xs italic">No decisions accepted yet.</p>
		{:else}
			<div class="flex flex-col gap-3 relative">
				<!-- Vertical line connecting nodes -->
				<div class="absolute left-[7px] top-2 bottom-2 w-[2px] bg-surface-200-800/50"></div>

				{#each $activePath as decision (decision.id)}
					<div class="flex items-start gap-3 relative z-10" transition:fade>
						<div class="w-4 h-4 rounded-full bg-primary-500 mt-0.5 shrink-0 border-2 border-surface-50"></div>
						<div class="flex flex-col gap-0.5">
							<p class="text-surface-900-50 font-medium text-xs leading-tight">
								{decision.cardSnapshot.title}
							</p>
							{#if decision.summary}
								<p class="text-surface-500-300 text-[11px] leading-tight">{decision.summary}</p>
							{/if}
							<p class="text-surface-400-500 text-[10px] uppercase tracking-wider">
								{new Date(decision.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
