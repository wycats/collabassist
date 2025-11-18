<script lang="ts">
	import Button from '$lib/ui/Button.svelte';
	import MessageView from '$lib/ui/MessageView.svelte';

	import ChatShell from '$lib/chat/ChatShell.svelte';
	import ChatThread from '$lib/chat/ChatThread.svelte';
	import ChatComposer from '$lib/chat/ChatComposer.svelte';
	import PlanningPanel from '$lib/chat/PlanningPanel.svelte';
	import InspectArtifactCard from '$lib/chat/InspectArtifactCard.svelte';

	import {
		type CardMessage,
		type Message,
		createUserTextMessage,
		createAssistantTextMessage
	} from '$lib/domain/message';

	import type { ChoiceOption } from '$lib/domain/card';
	import type {
		InterpretCard as InterpretCardSpec,
		InterpretOption,
		ProposeCard as ProposeCardSpec,
		ProposeOption,
		SelectionSummaryCard as SelectionSummaryCardSpec,
		SelectionSourceKind,
		LensCard as LensCardSpec,
		MockupCard as MockupCardSpec
	} from '$lib/cards/types';
	import { INITIAL_PHASE, type Phase } from '$lib/domain/phase';
	import {
		lockInterpret,
		lockPropose,
		lockInspectFromLens,
		lockInspectFromMockup
	} from '$lib/domain/planning-store';

	let messages: Message[] = [
		createAssistantTextMessage(
			'Welcome to the experimental AI client. Try typing, or inject a sample interpret card.'
		)
	];

	let draft = '';
	let phase: Phase = INITIAL_PHASE;
	let isRequestInFlight = false;

	function rewindToMessage(messageId: string) {
		const index = messages.findIndex((m) => m.id === messageId);
		if (index === -1) return;
		messages = messages.slice(0, index + 1);
	}

	async function sendMessage() {
		const trimmed = draft.trim();
		if (!trimmed) return;

		const userMsg = createUserTextMessage(trimmed);
		messages = [...messages, userMsg];
		draft = '';

		await requestInterpretCard(trimmed);
	}

	async function requestInterpretCard(latestUserMessage: string) {
		if (isRequestInFlight) return;
		isRequestInFlight = true;

		try {
			const response = await fetch('/api/cards', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: [{ role: 'user', content: latestUserMessage }],
					phase
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch interpret card');
			}

			const card = (await response.json()) as InterpretCardSpec;

			const cardMessage: CardMessage<InterpretCardSpec> = {
				id: card.id,
				role: 'assistant',
				kind: 'card',
				cardType: 'ai-interpret',
				spec: card,
				createdAt: new Date().toISOString()
			};

			messages = [...messages, cardMessage];
		} catch (error) {
			console.error(error);
			const assistantMsg = createAssistantTextMessage(
				"I couldn't generate an interpret card just now. Try again in a moment."
			);
			messages = [...messages, assistantMsg];
		} finally {
			isRequestInFlight = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	async function injectSampleInterpretCard() {
		await requestInterpretCard('Sample interpret card injection');
	}

	function appendSelectionSummaryCard(
		option: InterpretOption | ProposeOption,
		sourceCardKind: SelectionSourceKind
	) {
		const spec: SelectionSummaryCardSpec = {
			id: crypto.randomUUID(),
			kind: 'selection-summary',
			title: sourceCardKind === 'interpret' ? 'Interpretation locked in' : 'Proposal selected',
			description:
				sourceCardKind === 'interpret'
					? 'We will explore this interpretation next.'
					: 'Using this proposal as the spine for inspection.',
			flowId: 'slice-1',
			selectionId: option.id,
			selectionLabel: option.label,
			selectionSummary: option.summary,
			sourceCardKind
		};

		const summaryMessage: CardMessage<SelectionSummaryCardSpec> = {
			id: crypto.randomUUID(),
			role: 'assistant',
			kind: 'card',
			cardType: 'selection-summary',
			spec,
			createdAt: new Date().toISOString()
		};

		messages = [...messages, summaryMessage];
	}

	async function fetchProposeCard(optionId: string) {
		isRequestInFlight = true;
		try {
			phase = 'shape';
			const response = await fetch('/api/cards', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: [],
					phase,
					interaction: {
						type: 'interpret.selection',
						optionId
					}
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch propose card');
			}

			const card = (await response.json()) as ProposeCardSpec;

			const cardMessage: CardMessage<ProposeCardSpec> = {
				id: card.id,
				role: 'assistant',
				kind: 'card',
				cardType: 'ai-propose',
				spec: card,
				createdAt: new Date().toISOString()
			};

			messages = [...messages, cardMessage];
		} catch (error) {
			console.error(error);
			const assistantMsg = createAssistantTextMessage(
				"I couldn't generate a propose card just now. Try again in a moment."
			);
			messages = [...messages, assistantMsg];
		} finally {
			isRequestInFlight = false;
		}
	}

	async function fetchInspectCard(optionId: string) {
		isRequestInFlight = true;
		try {
			phase = 'inspect';
			const response = await fetch('/api/cards', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: [],
					phase,
					interaction: {
						type: 'propose.selection',
						optionId
					}
				})
			});

			if (!response.ok) {
				throw new Error('Failed to fetch inspect card');
			}

			const card = (await response.json()) as LensCardSpec | MockupCardSpec;
			const isLens = card.kind === 'lens';
			if (isLens) {
				lockInspectFromLens(card, phase);
			} else {
				lockInspectFromMockup(card, phase);
			}

			const cardMessage: CardMessage<LensCardSpec | MockupCardSpec> = {
				id: card.id,
				role: 'assistant',
				kind: 'card',
				cardType: isLens ? 'ai-lens' : 'ai-mockup',
				spec: card,
				createdAt: new Date().toISOString()
			};

			messages = [...messages, cardMessage];
		} catch (error) {
			console.error(error);
			const assistantMsg = createAssistantTextMessage(
				"I couldn't generate an inspect card just now. Try again in a moment."
			);
			messages = [...messages, assistantMsg];
		} finally {
			isRequestInFlight = false;
		}
	}

	async function handleCardSubmit(payload: {
		messageId: string;
		cardType: string;
		choice?: ChoiceOption;
		option?: InterpretOption | ProposeOption;
	}) {
		if (payload.cardType === 'choice' && payload.choice) {
			const { choice } = payload;

			const userMsg = createUserTextMessage(
				`I chose: ${choice.label}${choice.description ? ` — ${choice.description}` : ''}`
			);

			messages = [...messages, userMsg];
		}

		if (payload.cardType === 'ai-interpret' && payload.option) {
			if (isRequestInFlight) return;
			rewindToMessage(payload.messageId);
			lockInterpret(payload.option, 'shape');
			appendSelectionSummaryCard(payload.option, 'interpret');
			await fetchProposeCard(payload.option.id);
		}

		if (payload.cardType === 'ai-propose' && payload.option) {
			if (isRequestInFlight) return;
			rewindToMessage(payload.messageId);
			lockPropose(payload.option, 'inspect');
			appendSelectionSummaryCard(payload.option, 'propose');
			await fetchInspectCard(payload.option.id);
		}
	}
</script>

{#snippet HeaderRight()}
	<span> Stack: Svelte 5 · Skeleton · Bits · Baseline-first </span>
{/snippet}

{#snippet ThreadActions()}
	<Button variant="secondary" onclick={injectSampleInterpretCard}
		>Inject sample interpret card</Button
	>
{/snippet}

<ChatShell header-right={HeaderRight}>
	<div
		class="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6"
	>
		<ChatThread actions={ThreadActions}>
			{#each messages as message (message.id)}
				<MessageView {message} onCardSubmit={handleCardSubmit} />
			{/each}
		</ChatThread>

		<div class="flex flex-col gap-4 lg:sticky lg:top-4">
			<PlanningPanel />
			<InspectArtifactCard />
		</div>
	</div>

	<ChatComposer onSubmit={sendMessage}>
		<textarea
			class="max-h-32 min-h-10 flex-1 resize-y bg-transparent
           text-sm focus:outline-none"
			placeholder="Type a message…"
			bind:value={draft}
			on:keydown={handleKeydown}
		></textarea>
		<Button type="submit" variant="primary" disabled={!draft.trim() || isRequestInFlight}>
			{isRequestInFlight ? 'Thinking…' : 'Send'}
		</Button>
	</ChatComposer>
</ChatShell>
