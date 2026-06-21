<script lang="ts">
	import { decisions } from '$lib/domain/decisions-store';
	import { fade } from 'svelte/transition';

	const activePath = decisions.activePath;
	const heads = decisions.heads;
	const headId = decisions.headId;
	const props = $props<{
		onHeadChange?: (headId: string) => void;
	}>();

	function handleBranchChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		decisions.setHead(select.value);
		props.onHeadChange?.(select.value);
	}
</script>

<section aria-live="polite">
	<header>
		<div>
			<div>
				<span>Decisions Rail</span>
				<h3>{$activePath.length} Accepted</h3>
			</div>
			{#if $heads.length > 1}
				<select value={$headId} onchange={handleBranchChange} aria-label="Switch active branch">
					{#each $heads as head (head.id)}
						<option value={head.id}>
							{head.cardSnapshot.title}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	</header>

	<div class="rail-body">
		{#if $activePath.length === 0}
			<p>No decisions accepted yet.</p>
		{:else}
			<div>
				<div aria-hidden="true"></div>

				{#each $activePath as decision (decision.id)}
					<article transition:fade>
						<div aria-hidden="true"></div>
						<div>
							<p>
								{decision.cardSnapshot.title}
							</p>
							{#if decision.summary}
								<p>{decision.summary}</p>
							{/if}
							<time datetime={decision.acceptedAt}>
								{new Date(decision.acceptedAt).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</time>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 82%, transparent);
		border-radius: 0.85rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 92%, transparent);
		box-shadow:
			0 1px 2px hsl(220 18% 14% / 0.04),
			0 14px 32px hsl(220 24% 14% / 0.06);
	}

	header {
		border-bottom: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 70%, transparent);
		padding: 0.85rem 1rem;
	}

	header > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	span {
		display: block;
		font-size: 0.68rem;
		font-weight: 700;
		color: color-mix(
			in srgb,
			var(--color-surface-500, #71717a) 84%,
			var(--color-surface-900, #18181b)
		);
		text-transform: uppercase;
		letter-spacing: 0.09em;
	}

	h3 {
		margin: 0.1rem 0 0;
		font-size: 0.92rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-surface-900);
	}

	select {
		max-width: 13rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--color-surface-300, #d4d4d8) 72%, transparent);
		background-color: var(--color-surface-50, white);
		padding: 0.35rem 2rem 0.35rem 0.7rem;
		font-size: 0.75rem;
	}

	.rail-body {
		padding: 1rem;
		font-size: 0.86rem;
	}

	.rail-body > p {
		margin: 0;
		color: var(--color-surface-500, #71717a);
		font-size: 0.8rem;
		font-style: italic;
	}

	.rail-body > div {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.rail-body > div > div {
		position: absolute;
		top: 0.55rem;
		bottom: 0.55rem;
		left: 0.45rem;
		width: 1px;
		background: color-mix(in srgb, var(--color-surface-300, #d4d4d8) 82%, transparent);
	}

	article {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: flex-start;
		gap: 0.72rem;
	}

	article > div:first-child {
		margin-top: 0.2rem;
		width: 0.9rem;
		height: 0.9rem;
		flex-shrink: 0;
		border: 2px solid var(--color-surface-50, white);
		border-radius: 999px;
		background: var(--color-primary-500, #2563eb);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary-500, #2563eb) 45%, transparent);
	}

	article p {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.32;
	}

	article p:first-child {
		font-weight: 650;
		color: var(--color-surface-900);
	}

	article p + p {
		margin-top: 0.16rem;
		color: var(--color-surface-500, #71717a);
	}

	time {
		display: block;
		margin-top: 0.26rem;
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--color-surface-400, #a1a1aa);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@media (min-width: 900px) {
		.rail-body {
			padding: 1rem 1rem 0.9rem;
		}

		.rail-body > div {
			flex-direction: row;
			gap: 1rem;
			overflow-x: auto;
			padding: 0.1rem 0.15rem 0.25rem;
			scrollbar-color: color-mix(in srgb, var(--color-surface-400, #a1a1aa) 52%, transparent)
				transparent;
			scrollbar-width: thin;
		}

		.rail-body > div::-webkit-scrollbar {
			height: 0.45rem;
		}

		.rail-body > div::-webkit-scrollbar-track {
			background: transparent;
		}

		.rail-body > div::-webkit-scrollbar-thumb {
			border-radius: 999px;
			background: color-mix(in srgb, var(--color-surface-400, #a1a1aa) 42%, transparent);
		}

		.rail-body > div > div {
			top: 0.65rem;
			right: 1rem;
			bottom: auto;
			left: 0.55rem;
			width: auto;
			height: 1px;
		}

		article {
			min-width: 10rem;
			max-width: 13rem;
			flex-direction: column;
			gap: 0.48rem;
			padding-right: 0.5rem;
		}

		article > div:first-child {
			margin-top: 0;
		}
	}
</style>
