<script lang="ts">
	import type { MockupCard } from '$lib/cards/types';

	type Props = {
		regions: MockupCard['regions'];
		variant?: 'default' | 'compact';
	};

	const layoutOrder = ['shelf', 'bookcase', 'library'] as const;

	const props = $props<Props>();

	const variant = $derived.by(() => props.variant ?? 'default');

	const groups = $derived.by(() =>
		layoutOrder
			.map((layout) => ({
				layout,
				regions: props.regions.filter((region) => region.layout === layout)
			}))
			.filter((group) => group.regions.length > 0)
	);

	function formatLayout(layout: string) {
		return layout.charAt(0).toUpperCase() + layout.slice(1);
	}
</script>

<section aria-label="Structural sketch" data-variant={variant}>
	{#each groups as group (group.layout)}
		<section data-layout={group.layout}>
			<header>
				<p>{formatLayout(group.layout)}</p>
				<small>
					{group.regions.length} {group.regions.length === 1 ? 'region' : 'regions'}
				</small>
			</header>
			<ul>
				{#each group.regions as region (region.id)}
					<li>
						<p>{region.label}</p>
						{#if region.notes}
							<p>{region.notes}</p>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</section>

<style>
	section[data-variant] {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	section[data-variant] > section {
		border: 1px solid color-mix(in srgb, var(--sk-color-surface-500) 25%, transparent);
		border-radius: 0.85rem;
		padding: 0.65rem 0.85rem;
		background: color-mix(in srgb, var(--sk-color-surface-50) 80%, transparent);
	}

	section[data-layout='shelf'] {
		--accent-bg: color-mix(in srgb, var(--sk-color-warning-50) 35%, transparent);
	}

	section[data-layout='bookcase'] {
		--accent-bg: color-mix(in srgb, var(--sk-color-info-50) 35%, transparent);
	}

	section[data-layout='library'] {
		--accent-bg: color-mix(in srgb, var(--sk-color-success-50) 35%, transparent);
	}

	section[data-variant] > section {
		background: var(--accent-bg, color-mix(in srgb, var(--sk-color-surface-50) 80%, transparent));
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}

	header p {
		margin: 0;
		font-weight: 600;
		font-size: 0.95rem;
	}

	header small {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--sk-color-muted-600);
	}

	ul {
		list-style: none;
		margin: 0.35rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	li {
		padding: 0.3rem 0.1rem;
	}

	li p:first-child {
		margin: 0;
		font-weight: 600;
		font-size: 0.85rem;
	}

	li p + p {
		margin: 0.2rem 0 0;
		font-size: 0.78rem;
		color: var(--sk-color-muted-600);
	}

	section[data-variant='compact'] {
		gap: 0.5rem;
	}

	section[data-variant='compact'] > section {
		padding: 0.5rem 0.6rem;
	}

	section[data-variant='compact'] ul {
		gap: 0.25rem;
	}

	section[data-variant='compact'] li p:first-child {
		font-size: 0.8rem;
	}

	section[data-variant='compact'] li p + p {
		font-size: 0.72rem;
	}
</style>
