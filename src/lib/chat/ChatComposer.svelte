<!-- src/lib/chat/ChatComposer.svelte -->
<script lang="ts">
	export let onSubmit: () => void = () => {};
</script>

<section class="mt-2 border-t border-surface-200-800/70 pt-3">
	<form class="flex items-end gap-3" on:submit|preventDefault={onSubmit}>
		<div
			class="flex flex-1 items-end rounded-2xl border
             border-surface-200-800/70 bg-surface-50-950 px-3 py-2"
		>
			<slot />
		</div>
	</form>
</section>
