<script lang="ts">
	import Button from '$lib/ui/Button.svelte';
	import MessageView from '$lib/ui/MessageView.svelte';

	import ChatThread from '$lib/chat/ChatThread.svelte';
	import ChatComposer from '$lib/chat/ChatComposer.svelte';
	import PlanningPanel from '$lib/chat/PlanningPanel.svelte';
	import InspectArtifactCard from '$lib/chat/InspectArtifactCard.svelte';
	import RefinePanel from '$lib/chat/RefinePanel.svelte';
	import PromptBox from '$lib/ui/PromptBox.svelte';
	import Sidebar from '$lib/layout/Sidebar.svelte';
	import Canvas from '$lib/layout/Canvas.svelte';

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
		MockupCard as MockupCardSpec,
		AnyCard
	} from '$lib/cards/types';
	import { INITIAL_PHASE, type Phase } from '$lib/domain/phase';
	import { decisions } from '$lib/domain/decisions-store';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { activePath } = decisions;

	// Initialize decisions store with server data
	$effect(() => {
		if (data.decisions) {
			decisions.set(data.decisions);
		}
	});

	let messages: Message[] = $state([
		createAssistantTextMessage(
			'Welcome to the experimental AI client. Try typing, or inject a sample interpret card.'
		)
	]);

	let draft = $state('');
	let phase: Phase = $state(INITIAL_PHASE);
	let isRequestInFlight = $state(false);
	let refiningCard: AnyCard | null = $state(null);

	function handleRefine(card: AnyCard) {
		refiningCard = card;
	}

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
					phase,
					activePath: $activePath
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
					activePath: $activePath,
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
					activePath: $activePath,
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
			
			// Note: We no longer lock inspect here, we just show the card.
			// The user must explicitly "Accept" it to add to the rail (future slice).
			// For now, we treat interpret/propose selection as implicit acceptance for the rail.

			const isLens = card.kind === 'lens';
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

	async function persistDecision(card: AnyCard, summary: string | null = null) {
		try {
			const response = await fetch('/api/decisions', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					cardId: card.id,
					parentId: null, // TODO: Handle branching
					summary,
					cardSnapshot: card
				})
			});

			if (!response.ok) throw new Error('Failed to persist decision');
			const decision = await response.json();
			decisions.add(decision);
		} catch (e) {
			console.error('Failed to save decision', e);
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
			
			// Find the card spec from messages to snapshot it
			const cardMsg = messages.find(m => m.id === payload.messageId) as CardMessage<InterpretCardSpec>;
			if (cardMsg) {
				// Create a synthetic "Accepted" version of the card with the selection locked?
				// For now, just snapshot the interpret card and note the selection in summary
				await persistDecision(cardMsg.spec, `Selected intent: ${payload.option.label}`);
			}

			appendSelectionSummaryCard(payload.option, 'interpret');
			await fetchProposeCard(payload.option.id);
		}

		if (payload.cardType === 'ai-propose' && payload.option) {
			if (isRequestInFlight) return;
			rewindToMessage(payload.messageId);

			const cardMsg = messages.find(m => m.id === payload.messageId) as CardMessage<ProposeCardSpec>;
			if (cardMsg) {
				await persistDecision(cardMsg.spec, `Selected path: ${payload.option.label}`);
			}

			appendSelectionSummaryCard(payload.option, 'propose');
			await fetchInspectCard(payload.option.id);
		}
	}
	async function handleRefineApply(instructions: string) {
		if (!refiningCard || isRequestInFlight) return;
		isRequestInFlight = true;
		const cardToRefine = refiningCard; // Capture for async
		refiningCard = null; // Close panel

		try {
			const userMsg = createUserTextMessage(`Refine "${cardToRefine.title}": ${instructions}`);
			messages = [...messages, userMsg];

			const response = await fetch('/api/cards', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: [], // We could pass history, but for now just the refine context
					phase: 'refine',
					activePath: $activePath,
					interaction: {
						type: 'refine',
						sourceCard: cardToRefine,
						instructions
					}
				})
			});

			if (!response.ok) throw new Error('Failed to refine card');

			const newCard = (await response.json()) as AnyCard;

			const cardMessage: CardMessage<AnyCard> = {
				id: newCard.id,
				role: 'assistant',
				kind: 'card',
				cardType: `ai-${newCard.kind}`, // Assuming kind maps to cardType for now
				spec: newCard,
				createdAt: new Date().toISOString()
			};

			messages = [...messages, cardMessage];
		} catch (error) {
			console.error(error);
			const assistantMsg = createAssistantTextMessage(
				"I couldn't refine the card just now. Try again in a moment."
			);
			messages = [...messages, assistantMsg];
		} finally {
			isRequestInFlight = false;
		}
	}
	async function handleFork(card: AnyCard) {
		if (isRequestInFlight) return;
		isRequestInFlight = true;

		try {
			const userMsg = createUserTextMessage(`Fork "${card.title}"`);
			messages = [...messages, userMsg];

			const response = await fetch('/api/cards', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: [],
					phase: 'fork',
					activePath: $activePath,
					interaction: {
						type: 'fork',
						sourceCard: card
					}
				})
			});

			if (!response.ok) throw new Error('Failed to fork card');

			const newCard = (await response.json()) as AnyCard;

			const cardMessage: CardMessage<AnyCard> = {
				id: newCard.id,
				role: 'assistant',
				kind: 'card',
				cardType: `ai-${newCard.kind}`,
				spec: newCard,
				createdAt: new Date().toISOString()
			};

			messages = [...messages, cardMessage];
		} catch (error) {
			console.error(error);
			const assistantMsg = createAssistantTextMessage(
				"I couldn't fork the card just now. Try again in a moment."
			);
			messages = [...messages, assistantMsg];
		} finally {
			isRequestInFlight = false;
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

<div class="grid h-screen grid-cols-1 lg:grid-cols-[420px_1fr] overflow-hidden">
	<!-- Sidebar (Chat) -->
	<Sidebar>
		{#snippet footer()}
			<ChatComposer onSubmit={sendMessage}>
				<div class="flex items-end gap-2">
					<PromptBox
						bind:value={draft}
						placeholder="Ask anything..."
						disabled={isRequestInFlight}
						onsubmit={sendMessage}
					/>
					<Button
						type="button"
						variant="primary"
						size="sm"
						disabled={!draft.trim() || isRequestInFlight}
						onclick={sendMessage}
						class="mb-0.5 rounded-full w-8 h-8 !p-0 flex items-center justify-center shrink-0"
					>
						{#if isRequestInFlight}
							<div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
								<path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
							</svg>
						{/if}
					</Button>
				</div>
			</ChatComposer>
		{/snippet}

		<ChatThread actions={ThreadActions}>
			{#each messages as message (message.id)}
				<MessageView
					{message}
					onCardSubmit={handleCardSubmit}
					onRefine={handleRefine}
					onFork={handleFork}
				/>
			{/each}
		</ChatThread>
	</Sidebar>

	<!-- Canvas (Rail + Artifact) -->
	<Canvas>
		{#snippet rail()}
			<PlanningPanel />
		{/snippet}

		{#if refiningCard}
			<RefinePanel
				card={refiningCard}
				onClose={() => (refiningCard = null)}
				onApply={handleRefineApply}
			/>
		{:else}
			<!-- Show the head of the rail if available -->
			{#if $decisions.length > 0}
				{@const head = $decisions[$decisions.length - 1]}
				<InspectArtifactCard card={head.cardSnapshot} />
			{:else}
				<InspectArtifactCard card={null} />
			{/if}
		{/if}
	</Canvas>
</div>
