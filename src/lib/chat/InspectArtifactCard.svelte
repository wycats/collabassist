<script lang="ts">
	import LensSummary from '$lib/cards/LensSummary.svelte';
	import MockupRegions from '$lib/cards/MockupRegions.svelte';
	import type { ProductSpecArtifact } from '$lib/domain/artifact';

	let { artifact }: { artifact?: ProductSpecArtifact | null } = $props();
</script>

{#if artifact}
	<section aria-live="polite">
		<div class="artifact-body">
			<p>{artifact.data.brief.title}</p>
			<p>{artifact.data.brief.summary}</p>

			<div class="brief-grid">
				<div>
					<span>Intent</span>
					<p>{artifact.data.brief.intent ?? 'Not accepted yet'}</p>
				</div>
				<div>
					<span>Path</span>
					<p>{artifact.data.brief.path ?? 'Not accepted yet'}</p>
				</div>
			</div>

			{#if artifact.data.brief.acceptedDecisions.length > 0}
				<div class="artifact-stack">
					<h4>Accepted decisions</h4>
					<ul>
						{#each artifact.data.brief.acceptedDecisions as decision, index (`${index}:${decision}`)}
							<li>{decision}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if artifact.data.inspectCard.kind === 'mockup'}
				<div class="artifact-stack">
					<h4>{artifact.data.inspectCard.title}</h4>
					<MockupRegions regions={artifact.data.inspectCard.regions} />
					<details>
						<summary>View JSON</summary>
						<pre>{JSON.stringify(artifact.data, null, 2)}</pre>
					</details>
				</div>
			{:else if artifact.data.inspectCard.kind === 'lens'}
				<div class="artifact-stack">
					<h4>{artifact.data.inspectCard.title}</h4>
					<LensSummary
						lensType={artifact.data.inspectCard.lensType}
						payload={artifact.data.inspectCard.payload}
					/>
					<details>
						<summary>View JSON</summary>
						<pre>{JSON.stringify(artifact.data, null, 2)}</pre>
					</details>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<section class="empty">
		<div>
			<p>Inspect artifact</p>
			<p>None pinned yet</p>
			<p>Accept a mockup or lens card to pin a product spec artifact.</p>
		</div>
	</section>
{/if}

<style>
	section {
		background: transparent;
	}

	.empty div p:first-child {
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

	.artifact-body {
		padding: 0 0 1.5rem;
		font-size: 0.9rem;
	}

	.artifact-body > p:first-child {
		margin: 0;
		font-size: 1.14rem;
		font-weight: 740;
		line-height: 1.3;
		color: var(--color-surface-900);
	}

	.artifact-body > p + p {
		margin: 0.35rem 0 0;
		color: var(--color-surface-600, #52525b);
		font-size: 0.84rem;
		line-height: 1.42;
	}

	.artifact-stack {
		display: flex;
		flex-direction: column;
		gap: 0.38rem;
		margin-top: 1rem;
		border-top: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 66%, transparent);
		padding-top: 0.86rem;
	}

	.brief-grid {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.82rem;
		border-block: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 64%, transparent);
	}

	.brief-grid > div {
		padding: 0.62rem 0;
	}

	.brief-grid span {
		display: block;
		font-size: 0.65rem;
		font-weight: 750;
		color: var(--color-surface-500, #71717a);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.brief-grid p {
		margin: 0.2rem 0 0;
		color: var(--color-surface-900);
		font-size: 0.78rem;
		line-height: 1.35;
	}

	h4 {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 750;
		color: var(--color-surface-900);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	ul {
		display: grid;
		gap: 0.12rem;
		list-style: none;
		margin: 0;
		padding: 0;
		color: color-mix(in srgb, var(--color-surface-500, #71717a) 82%, var(--color-surface-900));
		font-size: 0.76rem;
		line-height: 1.38;
	}

	li {
		position: relative;
		padding-left: 0.75rem;
	}

	li::before {
		position: absolute;
		top: 0.54em;
		left: 0.1rem;
		width: 0.24rem;
		height: 0.24rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-surface-400, #a1a1aa) 72%, transparent);
		content: '';
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
		font-weight: 700;
	}

	.artifact-stack pre {
		margin: 0.25rem 0 0;
		padding: 0.6rem;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--color-surface-100, oklch(0.91 0 0)) 70%, transparent);
		font-size: 0.75rem;
		line-height: 1.3;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}

	.empty {
		display: grid;
		min-height: 16rem;
		place-items: center;
		border: 1px dashed color-mix(in srgb, var(--color-surface-300, #d4d4d8) 76%, transparent);
		border-radius: 0.72rem;
		border-style: dashed;
		background: color-mix(in srgb, var(--color-surface-50, white) 56%, transparent);
		color: var(--color-surface-500, #71717a);
		text-align: center;
	}

	.empty div {
		padding: 1.5rem;
	}

	.empty div p {
		margin: 0;
	}

	.empty div p:nth-child(2) {
		margin-top: 0.35rem;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-surface-900);
	}

	.empty div p:nth-child(3) {
		margin-top: 0.25rem;
		font-size: 0.84rem;
	}

	@media (min-width: 700px) {
		.brief-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.brief-grid > div + div {
			border-left: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 64%, transparent);
			padding-left: 0.8rem;
		}
	}
</style>
