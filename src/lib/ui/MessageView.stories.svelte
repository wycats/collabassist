<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MessageView from './MessageView.svelte';
	import type { Message, CardMessage } from '$lib/domain/message';
	import type { ChoiceCardSpec } from '$lib/domain/card';
	import { createAssistantTextMessage, createUserTextMessage } from '$lib/domain/message';

	const assistantText = createAssistantTextMessage('Hello from the assistant.');
	const userText = createUserTextMessage('Hi!');

	const choiceCard: CardMessage<ChoiceCardSpec> = {
		id: 'choice-1',
		role: 'assistant',
		kind: 'card',
		cardType: 'choice',
		createdAt: new Date().toISOString(),
		spec: {
			prompt: 'Pick one:',
			options: [
				{ id: 'a', label: 'Option A' },
				{ id: 'b', label: 'Option B' }
			]
		}
	};

	const { Story } = defineMeta({
		title: 'Chat/MessageView',
		component: MessageView,
		tags: ['autodocs'],
		args: {
			message: assistantText as Message
		}
	});
</script>

<Story name="AssistantText" />

<Story name="UserText" args={{ message: userText }} />

<Story name="ChoiceCard" args={{ message: choiceCard }} />
