<script lang="ts">
	import type { LensCard, LensType } from '$lib/cards/types';

	type Props = {
		lensType: LensType;
		payload: LensCard['payload'];
		variant?: 'default' | 'compact';
	};

	type LensSection = {
		id: string;
		label: string;
		contents: string[];
	};

	type ParsedPayload = {
		sections: LensSection[];
		callsToAction: string[];
	};

	const props = $props<Props>();

	function coercePayload(payload: unknown): ParsedPayload {
		if (!payload || typeof payload !== 'object') {
			return { sections: [], callsToAction: [] };
		}

		const raw = payload as Record<string, unknown>;

		const sections = Array.isArray(raw.sections)
			? raw.sections
				.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
				.map((item) => {
					const id = typeof item.id === 'string' ? item.id : crypto.randomUUID();
					const label = typeof item.label === 'string' ? item.label : 'Section';
					const contents = Array.isArray(item.contents)
						? item.contents.filter((value): value is string => typeof value === 'string')
						: [];
					return { id, label, contents } satisfies LensSection;
				})
			: [];

		const callsToAction = Array.isArray(raw.callsToAction)
			? raw.callsToAction.filter((value): value is string => typeof value === 'string')
			: [];

		return { sections, callsToAction };
	}

	const parsed = $derived.by(() => coercePayload(props.payload));
	const variant = $derived.by(() => props.variant ?? 'default');
</script>

<section data-variant={variant} aria-label={`Lens: ${props.lensType}`}>
	<p class="lens-label">Lens · {props.lensType}</p>

	{#if parsed.sections.length}
		<ul>
			{#each parsed.sections as section (section.id)}
				<li>
					<p>{section.label}</p>
					{#if section.contents.length}
						<ul>
							{#each section.contents as content, index}
								<li data-kind="content">{content}</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="placeholder">No structured sections provided.</p>
	{/if}

	{#if parsed.callsToAction.length}
		<div class="ctas">
			<p>Calls to action</p>
			<ul>
				{#each parsed.callsToAction as action, index}
					<li>{action}</li>
				{/each}
			</ul>
		</div>
	{/if}
</section>

<style>
	section[data-variant] {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lens-label {
		margin: 0;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--sk-color-muted-600);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	ul > li {
		border: 1px solid color-mix(in srgb, var(--sk-color-surface-500) 20%, transparent);
		border-radius: 0.6rem;
		padding: 0.5rem 0.6rem;
		background: color-mix(in srgb, var(--sk-color-surface-50) 70%, transparent);
	}

	ul > li > p {
		margin: 0;
		font-weight: 600;
		font-size: 0.9rem;
	}

	ul > li ul {
		margin-top: 0.35rem;
		border-left: 2px solid color-mix(in srgb, var(--sk-color-muted-500) 40%, transparent);
		padding-left: 0.65rem;
		gap: 0.25rem;
	}

	li[data-kind='content'] {
		font-size: 0.8rem;
		color: var(--sk-color-muted-700);
	}

	.placeholder {
		margin: 0;
		font-size: 0.8rem;
		color: var(--sk-color-muted-600);
	}

	.ctas {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.ctas > p {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--sk-color-muted-500);
	}

	.ctas ul {
		gap: 0.25rem;
	}

	.ctas li {
		font-size: 0.78rem;
		color: var(--sk-color-muted-700);
	}

	section[data-variant='compact'] {
		gap: 0.5rem;
	}

	section[data-variant='compact'] ul > li {
		padding: 0.4rem 0.5rem;
	}

	section[data-variant='compact'] ul > li > p {
		font-size: 0.82rem;
	}

	section[data-variant='compact'] li[data-kind='content'] {
		font-size: 0.74rem;
	}

	section[data-variant='compact'] .ctas li {
		font-size: 0.72rem;
	}
</style>
