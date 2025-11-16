<script lang="ts">
	import Button from '$lib/ui/Button.svelte';
	import MessageView from '$lib/ui/MessageView.svelte';

	import ChatShell from '$lib/chat/ChatShell.svelte';
	import ChatThread from '$lib/chat/ChatThread.svelte';
	import ChatComposer from '$lib/chat/ChatComposer.svelte';

	import {
		type Message,
		createUserTextMessage,
		createAssistantTextMessage,
		createAssistantChoiceCard
	} from '$lib/domain/message';

	import type { ChoiceCardSpec, ChoiceOption } from '$lib/domain/card';

	let messages: Message[] = [
		createAssistantTextMessage(
			'Welcome to the experimental AI client. Try typing, or inject a sample choice card.'
		)
	];

	let draft = '';

	function sendMessage() {
		const trimmed = draft.trim();
		if (!trimmed) return;

		const userMsg = createUserTextMessage(trimmed);
		messages = [...messages, userMsg];
		draft = '';

		const assistantMsg = createAssistantTextMessage(
			`You said: "${trimmed}". (AI backend not wired yet.)`
		);
		messages = [...messages, assistantMsg];
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function injectSampleChoiceCard() {
		const spec: ChoiceCardSpec = {
			prompt: 'Which direction should we explore next?',
			options: [
				{
					id: 'cards',
					label: 'Design new card types',
					description: 'Focus on structure, flows, and interaction patterns.'
				},
				{
					id: 'artifacts',
					label: 'Artifact modeling',
					description: 'Docs, canvases, schemas, and how the assistant edits them.'
				},
				{
					id: 'backend',
					label: 'Wire the real AI backend',
					description: 'Vercel AI SDK, tools, streaming, and message protocol.'
				}
			]
		};

		const card = createAssistantChoiceCard(spec);
		messages = [...messages, card];
	}

	function handleCardSubmit(payload: {
		messageId: string;
		cardType: string;
		choice?: ChoiceOption;
		[key: string]: any;
	}) {
		if (payload.cardType === 'choice' && payload.choice) {
			const { choice } = payload;

			const userMsg = createUserTextMessage(
				`I chose: ${choice.label}${choice.description ? ` — ${choice.description}` : ''}`
			);

			messages = [...messages, userMsg];
		}
	}
</script>

<ChatShell>
	<span slot="header-right"> Stack: Svelte 5 · Skeleton · Bits · Baseline-first </span>

	<ChatThread>
		<Button slot="actions" variant="secondary" on:click={injectSampleChoiceCard}>
			Inject sample choice card
		</Button>

		{#each messages as message (message.id)}
			<MessageView {message} onCardSubmit={handleCardSubmit} />
		{/each}
	</ChatThread>

	<ChatComposer onSubmit={sendMessage}>
		<textarea
			class="max-h-[8rem] min-h-[2.5rem] flex-1 resize-y bg-transparent
           text-sm focus:outline-none"
			placeholder="Type a message…"
			bind:value={draft}
			on:keydown={handleKeydown}
		/>
		<Button type="submit" variant="primary" disabled={!draft.trim()}>Send</Button>
	</ChatComposer>
</ChatShell>
