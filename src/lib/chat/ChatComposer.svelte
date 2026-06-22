<script lang="ts">
	import { type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<section>
	<div>
		<div>
			{@render children()}
		</div>
	</div>
</section>

<style>
	section {
		margin-top: 0.8rem;
		padding: 0 0 0.35rem;
	}

	section > div {
		position: relative;
		display: flex;
		align-items: end;
		gap: 0.5rem;
		border: 1px solid color-mix(in srgb, var(--color-surface-300, #d4d4d8) 70%, transparent);
		border-radius: 1rem;
		background: color-mix(in srgb, var(--color-surface-50, white) 94%, transparent);
		padding: 0.45rem;
		box-shadow:
			0 1px 2px hsl(220 18% 14% / 0.04),
			0 10px 22px hsl(220 24% 16% / 0.05);
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}

	section > div:focus-within {
		border-color: color-mix(
			in srgb,
			var(--color-primary-500, #2563eb) 34%,
			var(--color-surface-300, #d4d4d8)
		);
		background: var(--color-surface-50, white);
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--color-primary-500, #2563eb) 8%, transparent),
			0 12px 28px hsl(220 24% 16% / 0.07);
	}

	section > div > div {
		min-width: 0;
		flex: 1;
		padding: 0.35rem 0.4rem 0.35rem 0.55rem;
	}
</style>
