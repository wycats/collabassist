<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChoiceCard from './ChoiceCard.svelte';
	import type { CardMessage } from '$lib/domain/message';
	import type { ChoiceCardSpec } from '$lib/domain/card';

	const message: CardMessage<ChoiceCardSpec> = {
		id: 'choice-1',
		role: 'assistant',
		kind: 'card',
		cardType: 'choice',
		createdAt: new Date().toISOString(),
		spec: {
			prompt: 'Which direction should we explore next?',
			options: [
				{ id: 'cards', label: 'Design new card types', description: 'Structure & flows.' },
				{ id: 'artifacts', label: 'Artifact modeling', description: 'Docs, canvases, schemas.' },
				{ id: 'backend', label: 'Wire real AI backend', description: 'Vercel AI SDK, tools.' }
			]
		}
	};

	const { Story } = defineMeta({
		title: 'Cards/ChoiceCard',
		component: ChoiceCard,
		tags: ['autodocs'],
		args: {
			message
		}
	});
</script>

<Story name="Default" />
