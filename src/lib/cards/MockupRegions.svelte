<script lang="ts">
	import type { MockupCard } from '$lib/cards/types';

	type Props = {
		regions: MockupCard['regions'];
		variant?: 'default' | 'compact';
		availableUnits?: number;
	};

	let { regions, variant: variantProp, availableUnits: unitsProp }: Props = $props();

	const variant = $derived.by(() => variantProp ?? 'default');
	const availableUnits = $derived.by(() =>
		Number.isFinite(unitsProp) ? Math.max(0, unitsProp!) : 3
	);

	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	type Annotated = MockupCard['regions'][number] & { letter: string };

	type StackRow =
		| { kind: 'shelf'; region: Annotated }
		| { kind: 'sidebar'; sidebar: Annotated; main: Stack };

	type Stack = { kind: 'stack'; rows: StackRow[] };

	const sidebarBehaviorFor = (region: Annotated | undefined, units: number) => {
		if (!region || region.role !== 'sidebar') return 'shelf' as const;
		return units >= 3 ? 'stack' : 'shelf';
	};

	const buildStack = (annotated: Annotated[], units: number): Stack => {
		if (annotated.length === 0) {
			return { kind: 'stack', rows: [] };
		}

		const [next, ...rest] = annotated;
		const behavior = sidebarBehaviorFor(next, units);

		if (behavior === 'stack') {
			return {
				kind: 'stack',
				rows: [
					{
						kind: 'sidebar',
						sidebar: next,
						main: buildStack(rest, units)
					}
				]
			};
		}

		const tail = buildStack(rest, units);
		return {
			kind: 'stack',
			rows: [{ kind: 'shelf', region: next }, ...tail.rows]
		};
	};

	const layout = $derived.by(() => {
		const annotated: Annotated[] = regions.map((region, index) => ({
			...region,
			letter: letters[index] ?? '?'
		}));

		const tree = buildStack(annotated, availableUnits);

		return { annotated, tree };
	});
</script>

<section aria-label="Structural sketch" data-variant={variant}>
	{#if layout.tree.rows.length === 1 && layout.tree.rows[0].kind === 'sidebar'}
		<!-- Sidebar column + main stack -->
		<div class="skeleton" data-layout="sidebar" aria-hidden="true">
			<div class="column" data-column="sidebar">
				<div
					class="region"
					data-region-role={layout.tree.rows[0].sidebar.role ?? undefined}
					data-layout={layout.tree.rows[0].sidebar.layout}
				>
					<span>{layout.tree.rows[0].sidebar.letter}</span>
				</div>
			</div>
			<div class="column">
				{#each layout.tree.rows[0].main.rows as row (row.kind === 'shelf' ? row.region.id : `sidebar-${row.sidebar.id}`)}
					{#if row.kind === 'shelf'}
						<div
							class="region"
							data-region-role={row.region.role ?? undefined}
							data-layout={row.region.layout}
						>
							<span>{row.region.letter}</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<!-- Pure stack of shelves -->
		<div class="skeleton" data-layout="stack" aria-hidden="true">
			{#each layout.tree.rows as row (row.kind === 'shelf' ? row.region.id : `sidebar-${row.sidebar.id}`)}
				{#if row.kind === 'shelf'}
					<div
						class="region"
						data-region-role={row.region.role ?? undefined}
						data-layout={row.region.layout}
					>
						<span>{row.region.letter}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="legend" aria-label="Region legend">
		{#each layout.annotated as region (region.id)}
			<div>
				<span class="letter">{region.letter}</span>
				<div>
					<p>{region.label}</p>
					{#if region.notes}
						<p>{region.notes}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	section[data-variant] {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.5rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--color-surface-50, oklch(0.99 0 0)) 90%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-surface-200, oklch(0.81 0 0)) 60%, transparent);
	}

	.skeleton[data-layout='sidebar'] {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 2.1fr);
		gap: 0.4rem;
		align-items: stretch;
	}

	.skeleton[data-layout='stack'] {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.column[data-column='sidebar'] {
		min-height: 100%;
	}

	.region {
		--accent: var(--color-surface-200, oklch(0.81 0 0));
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.6rem;
		width: 100%;
		font-weight: 600;
		font-size: 0.9rem;
		background: color-mix(in srgb, var(--accent) 40%, var(--color-surface-50, oklch(0.99 0 0)));
		border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
	}

	.region[data-region-role='sidebar'] {
		min-height: 100%;
	}

	.region[data-region-role='switcher'] {
		--accent: var(--color-surface-300, oklch(0.87 0 0));
	}

	.region[data-layout='shelf'] {
		--accent: var(--color-surface-200, oklch(0.81 0 0));
		height: 0.9rem;
	}

	.region[data-layout='bookcase'] {
		--accent: var(--color-surface-200, oklch(0.81 0 0));
		height: 1.6rem;
	}

	.region[data-layout='library'] {
		--accent: var(--color-surface-200, oklch(0.81 0 0));
		height: 2.4rem;
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.legend > div {
		display: flex;
		gap: 0.55rem;
		align-items: flex-start;
	}

	.letter {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--color-surface-900, oklch(0.25 0 0)) 10%, transparent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.8rem;
		color: color-mix(
			in srgb,
			var(--color-surface-50, oklch(0.99 0 0)) 85%,
			var(--color-surface-200, oklch(0.81 0 0))
		);
	}

	.legend p {
		margin: 0;
		font-size: 0.82rem;
	}

	.legend p + p {
		margin-top: 0.15rem;
		font-size: 0.75rem;
		color: color-mix(
			in srgb,
			var(--color-surface-600, oklch(0.45 0 0)) 65%,
			var(--color-surface-900, oklch(0.25 0 0))
		);
	}

	section[data-variant='compact'] .skeleton {
		padding: 0.4rem;
		gap: 0.35rem;
	}

	section[data-variant='compact'] .region {
		font-size: 0.85rem;
	}

	section[data-variant='compact'] .legend p {
		font-size: 0.76rem;
	}

	section[data-variant='compact'] .legend p + p {
		font-size: 0.7rem;
	}
</style>
