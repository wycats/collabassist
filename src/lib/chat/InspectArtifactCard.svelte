<script lang="ts">
	import LensSummary from '$lib/cards/LensSummary.svelte';
	import MockupRegions from '$lib/cards/MockupRegions.svelte';
	import type { ProductSpecArtifact } from '$lib/domain/artifact';

	let { artifact }: { artifact?: ProductSpecArtifact | null } = $props();
</script>

{#if artifact}
	<section aria-live="polite">
		<header>
			<div>
				<span>Artifact</span>
				<h3>{artifact.title}</h3>
			</div>
			<span class="badge">{artifact.type}</span>
		</header>

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
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 82%, transparent);
		border-radius: 0.95rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 94%, transparent);
		box-shadow:
			0 1px 2px hsl(220 18% 14% / 0.04),
			0 18px 48px hsl(220 24% 14% / 0.08);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 72%, transparent);
		padding: 0.95rem 1rem;
	}

	header span:first-child,
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

	h3 {
		margin: 0.1rem 0 0;
		font-size: 0.92rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-surface-900);
	}

	.badge {
		border-radius: 999px;
		padding: 0.18rem 0.7rem;
		font-size: 0.65rem;
		font-weight: 750;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		background: color-mix(
			in srgb,
			var(--color-primary-500, #2563eb) 10%,
			var(--color-surface-50, white)
		);
		color: color-mix(in srgb, var(--color-primary-500, #2563eb) 82%, var(--color-surface-900));
	}

	.artifact-body {
		padding: 1rem;
		font-size: 0.9rem;
	}

	.artifact-body > p:first-child {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-surface-900);
	}

	.artifact-body > p + p {
		margin: 0.35rem 0 0;
		color: var(--color-surface-600, #52525b);
		font-size: 0.84rem;
		line-height: 1.45;
	}

	.artifact-stack {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: 1rem;
	}

	.brief-grid {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.9rem;
	}

	.brief-grid > div {
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 70%, transparent);
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--color-surface-100, #f4f4f5) 55%, transparent);
		padding: 0.7rem;
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
		margin: 0.25rem 0 0;
		color: var(--color-surface-900);
		font-size: 0.8rem;
		line-height: 1.4;
	}

	h4 {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 750;
		color: var(--color-surface-900);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	ul {
		margin: 0;
		padding-left: 1rem;
		color: var(--color-surface-600, #52525b);
		font-size: 0.8rem;
		line-height: 1.45;
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
		max-height: 16rem;
		overflow: auto;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--color-surface-100, oklch(0.91 0 0)) 70%, transparent);
		font-size: 0.75rem;
		line-height: 1.3;
	}

	.empty {
		display: grid;
		min-height: 18rem;
		place-items: center;
		border-style: dashed;
		background: color-mix(in srgb, var(--color-surface-50, white) 56%, transparent);
		color: var(--color-surface-500, #71717a);
		text-align: center;
	}

	.empty div {
		padding: 2rem;
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
</style>
