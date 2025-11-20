<script lang="ts">
	import type { Snippet } from 'svelte';

	const props = $props<{
		title: string;
		description?: string;
		children?: Snippet;
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
			{#if props.onFork}
				<button
					onclick={props.onFork}
					class="text-surface-500-400 hover:text-primary-500 hover:bg-surface-100-800 rounded p-1 transition-colors"
					title="Fork this card"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							fill-rule="evenodd"
							d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
			{#if props.onRefine}
				<button
					onclick={props.onRefine}
					class="text-surface-500-400 hover:text-primary-500 hover:bg-surface-100-800 rounded p-1 transition-colors"
					title="Refine this card"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-4 h-4"
					>
						<path
							d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"
						/>
						<path
							d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"
						/>
					</svg>
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
		border: 1px solid color-mix(in lab, var(--surface-400) 40%, transparent);
		border-radius: 0.9rem;
		padding: 1rem;
		background: color-mix(in lab, var(--surface-50) 70%, transparent);
		box-shadow: 0 6px 24px hsl(220 20% 20% / 0.08);
		max-width: 28rem;
	}

	section > header {
		margin-bottom: 0.75rem;
	}

	section > header h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--surface-900);
	}

	section > header p {
		margin: 0.35rem 0 0;
		font-size: 0.85rem;
		color: color-mix(in lab, var(--surface-600) 60%, var(--surface-900));
	}

	section > div {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
