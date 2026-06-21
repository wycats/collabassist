<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import GitFork from '@lucide/svelte/icons/git-fork';
	import PencilLine from '@lucide/svelte/icons/pencil-line';
	import type { Snippet } from 'svelte';

	const props = $props<{
		title: string;
		description?: string;
		children?: Snippet;
		onAccept?: () => void;
		onRefine?: () => void;
		onFork?: () => void;
	}>();
</script>

<section aria-live="polite">
	<header class="flex items-start justify-between gap-2">
		<div>
			<h3>{props.title}</h3>
			{#if props.description}
				<p>{props.description}</p>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			{#if props.onAccept}
				<button
					type="button"
					onclick={props.onAccept}
					title="Accept this card"
					aria-label="Accept this card"
				>
					<Check size={16} aria-hidden="true" />
				</button>
			{/if}
			{#if props.onFork}
				<button
					type="button"
					onclick={props.onFork}
					title="Fork this card"
					aria-label="Fork this card"
				>
					<GitFork size={16} aria-hidden="true" />
				</button>
			{/if}
			{#if props.onRefine}
				<button
					type="button"
					onclick={props.onRefine}
					title="Refine this card"
					aria-label="Refine this card"
				>
					<PencilLine size={16} aria-hidden="true" />
				</button>
			{/if}
		</div>
	</header>

	<div>
		{@render props.children?.()}
	</div>
</section>

<style>
	section {
		max-width: 100%;
		border: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 68%, transparent);
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 96%, transparent);
		box-shadow: 0 8px 20px hsl(220 22% 14% / 0.045);
		padding: 0.82rem;
	}

	section > header {
		margin-bottom: 0.58rem;
	}

	section > header > div:first-child {
		min-width: 0;
	}

	section > header h3 {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 650;
		line-height: 1.25;
		color: var(--color-surface-900);
	}

	section > header p {
		margin: 0.28rem 0 0;
		font-size: 0.78rem;
		line-height: 1.42;
		color: color-mix(in lab, var(--color-surface-600) 60%, var(--color-surface-900));
	}

	section > header button {
		display: inline-flex;
		width: 1.65rem;
		height: 1.65rem;
		align-items: center;
		justify-content: center;
		border: 1px solid transparent;
		border-radius: 0.55rem;
		background: transparent;
		color: color-mix(
			in srgb,
			var(--color-surface-500, #71717a) 88%,
			var(--color-surface-900, #18181b)
		);
		transition:
			background 130ms ease,
			border-color 130ms ease,
			color 130ms ease;
	}

	section > header button:hover,
	section > header button:focus-visible {
		border-color: color-mix(in srgb, var(--color-surface-300, #d4d4d8) 80%, transparent);
		background: color-mix(in srgb, var(--color-surface-100, #f4f4f5) 86%, transparent);
		color: var(--color-primary-500, #2563eb);
		outline: none;
	}

	section > div {
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
	}
</style>
