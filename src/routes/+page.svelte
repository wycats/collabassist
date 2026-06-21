<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import SendHorizontal from '@lucide/svelte/icons/send-horizontal';
	import { resolve } from '$app/paths';
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
		AnyCard,
		InterpretCard,
		InterpretOption,
		ProposeCard,
		ProposeOption,
		SelectionSourceKind,
		SelectionSummaryCard
	} from '$lib/cards/types';
	import { INITIAL_PHASE, type Phase } from '$lib/domain/phase';
	import { decisions } from '$lib/domain/decisions-store';
	import type { DecisionNode } from '$lib/domain/decisions-store';
	import type { ProductSpecArtifact } from '$lib/domain/artifact';
	import type { Project } from '$lib/domain/project';
	import type { PageData } from './$types';

	const fallbackProject: Project = {
		id: 'local-product-spec',
		title: 'Untitled product spec',
		seedPrompt: null,
		activeHeadId: null,
		pinnedArtifactId: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	let {
		data = {
			projects: [fallbackProject],
			activeProject: fallbackProject,
			decisions: [],
			artifacts: [],
			pinnedArtifact: null
		}
	}: { data?: PageData } = $props();

	const activePath = decisions.activePath;
	const head = decisions.head;

	function initialProjects(pageData: PageData) {
		return pageData.projects ?? [fallbackProject];
	}

	function initialActiveProject(pageData: PageData) {
		return pageData.activeProject ?? fallbackProject;
	}

	function initialArtifacts(pageData: PageData) {
		return pageData.artifacts ?? [];
	}

	$effect(() => {
		projects = data.projects ?? [fallbackProject];
		activeProject = data.activeProject ?? fallbackProject;
		artifacts = data.artifacts ?? [];
		if (data.decisions) {
			decisions.set(data.decisions, data.activeProject?.activeHeadId ?? null);
		}
	});

	// Load data seeds mutable workspace state for SSR; the effect above syncs later navigations.
	// svelte-ignore state_referenced_locally
	let projects: Project[] = $state(initialProjects(data));
	// svelte-ignore state_referenced_locally
	let activeProject: Project = $state(initialActiveProject(data));
	// svelte-ignore state_referenced_locally
	let artifacts: ProductSpecArtifact[] = $state(initialArtifacts(data));
	let messages: Message[] = $state([
		createAssistantTextMessage('Welcome back to Collabassist. Send a prompt to start a card loop.')
	]);
	let draft = $state('');
	let phase: Phase = $state(INITIAL_PHASE);
	let isRequestInFlight = $state(false);
	let refiningCard: AnyCard | null = $state(null);
	let candidateParentIds: Record<string, string | null> = $state({});
	let activeArtifact = $derived(artifactForPath($activePath, artifacts));

	type CardRequestPhase = Phase | 'refine' | 'fork';

	type CardRequest = {
		messages?: { role: string; content: string }[];
		phase: CardRequestPhase;
		interaction?: Record<string, unknown>;
	};

	type DecisionResponse = {
		decision: DecisionNode;
		artifact?: ProductSpecArtifact | null;
	};

	function cardTypeFor(card: AnyCard) {
		if (card.kind === 'selection-summary') return 'selection-summary';
		return `ai-${card.kind}`;
	}

	function artifactForPath(path: DecisionNode[], artifactList: ProductSpecArtifact[]) {
		const artifactByDecisionId = new Map(
			artifactList.map((artifact) => [artifact.sourceDecisionId, artifact])
		);

		for (const decision of path.slice().reverse()) {
			const artifact = artifactByDecisionId.get(decision.id);
			if (artifact) return artifact;
		}

		return null;
	}

	function summarizeArtifact(artifact: ProductSpecArtifact | null) {
		if (!artifact) return null;
		return `${artifact.title}: ${artifact.data.brief.summary}`;
	}

	function upsertArtifact(artifact: ProductSpecArtifact) {
		artifacts = [...artifacts.filter((existing) => existing.id !== artifact.id), artifact];
		activeProject = {
			...activeProject,
			pinnedArtifactId: artifact.id,
			updatedAt: artifact.updatedAt
		};
		projects = projects.map((project) =>
			project.id === activeProject.id ? activeProject : project
		);
	}

	async function updateActiveProject(updates: Partial<Project>) {
		const response = await fetch(`/api/projects/${activeProject.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			throw new Error('Failed to update project');
		}

		activeProject = await response.json();
		projects = projects.map((project) =>
			project.id === activeProject.id ? activeProject : project
		);
		return activeProject;
	}

	async function ensureProjectSeed(prompt: string) {
		if (activeProject.seedPrompt) return activeProject;
		return updateActiveProject({ seedPrompt: prompt });
	}

	async function createProject() {
		const response = await fetch('/api/projects', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({})
		});

		if (!response.ok) {
			throw new Error('Failed to create project');
		}

		const project = (await response.json()) as Project;
		window.location.assign(`${resolve('/')}?projectId=${project.id}`);
	}

	function handleProjectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		if (select.value && select.value !== activeProject.id) {
			window.location.assign(`${resolve('/')}?projectId=${select.value}`);
		}
	}

	async function handleHeadChange(headId: string) {
		try {
			await updateActiveProject({ activeHeadId: headId });
		} catch (error) {
			console.error(error);
			messages = [
				...messages,
				createAssistantTextMessage("I couldn't save that branch selection.")
			];
		}
	}

	function appendAssistantCard(card: AnyCard) {
		const cardMessage: CardMessage<AnyCard> = {
			id: card.id,
			role: 'assistant',
			kind: 'card',
			cardType: cardTypeFor(card),
			spec: card,
			createdAt: new Date().toISOString()
		};

		messages = [...messages, cardMessage];
	}

	async function requestCard(body: CardRequest) {
		const response = await fetch('/api/cards', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: activeProject.id,
				seedPrompt: activeProject.seedPrompt,
				currentArtifactSummary: summarizeArtifact(activeArtifact),
				messages: body.messages ?? [],
				phase: body.phase,
				activePath: $activePath,
				interaction: body.interaction
			})
		});

		if (!response.ok) {
			throw new Error('Failed to fetch card');
		}

		return (await response.json()) as AnyCard;
	}

	async function sendMessage() {
		const trimmed = draft.trim();
		if (!trimmed || isRequestInFlight) return;

		const userMsg = createUserTextMessage(trimmed);
		messages = [...messages, userMsg];
		draft = '';
		phase = 'discover';
		isRequestInFlight = true;

		try {
			await ensureProjectSeed(trimmed);
			const card = await requestCard({
				messages: [{ role: 'user', content: trimmed }],
				phase
			});
			appendAssistantCard(card);
		} catch (error) {
			console.error(error);
			messages = [
				...messages,
				createAssistantTextMessage("I couldn't generate an interpret card just now.")
			];
		} finally {
			isRequestInFlight = false;
		}
	}

	async function injectSampleInterpretCard() {
		if (isRequestInFlight) return;
		draft = 'Help me design the next collaboration loop for this app.';
		await sendMessage();
	}

	function rewindToMessage(messageId: string) {
		const index = messages.findIndex((message) => message.id === messageId);
		if (index === -1) return;
		messages = messages.slice(0, index + 1);
	}

	function findCardMessage<TCard extends AnyCard>(messageId: string) {
		return messages.find(
			(message): message is CardMessage<TCard> =>
				message.kind === 'card' && message.id === messageId
		);
	}

	function findDecisionForCard(card: AnyCard) {
		return $decisions.find(
			(decision) => decision.cardId === card.id || decision.cardSnapshot.id === card.id
		);
	}

	function isCardAccepted(card: AnyCard) {
		return Boolean(findDecisionForCard(card));
	}

	function parentIdForCandidate(sourceCard: AnyCard) {
		const sourceDecision = findDecisionForCard(sourceCard);
		return sourceDecision ? sourceDecision.parentId : ($head?.id ?? null);
	}

	function appendSelectionSummaryCard(
		option: InterpretOption | ProposeOption,
		sourceCardKind: SelectionSourceKind
	) {
		const spec: SelectionSummaryCard = {
			id: crypto.randomUUID(),
			kind: 'selection-summary',
			title: sourceCardKind === 'interpret' ? 'Interpretation locked in' : 'Proposal selected',
			description:
				sourceCardKind === 'interpret'
					? 'We will explore this interpretation next.'
					: 'Using this proposal as the spine for inspection.',
			flowId: 'stabilized-loop',
			selectionId: option.id,
			selectionLabel: option.label,
			selectionSummary: option.summary,
			sourceCardKind
		};

		appendAssistantCard(spec);
	}

	async function persistDecision(
		card: AnyCard,
		summary: string | null = null,
		parentId = $head?.id ?? null
	) {
		const response = await fetch('/api/decisions', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				projectId: activeProject.id,
				cardId: card.id,
				parentId,
				summary,
				cardSnapshot: card
			})
		});

		if (!response.ok) {
			throw new Error('Failed to persist decision');
		}

		const result = (await response.json()) as DecisionResponse;
		decisions.add(result.decision);
		activeProject = {
			...activeProject,
			activeHeadId: result.decision.id,
			pinnedArtifactId: result.artifact?.id ?? activeProject.pinnedArtifactId
		};
		projects = projects.map((project) =>
			project.id === activeProject.id ? activeProject : project
		);
		if (result.artifact) upsertArtifact(result.artifact);
		return result.decision;
	}

	async function fetchProposeCard(option: InterpretOption, sourceCard: InterpretCard) {
		phase = 'shape';
		const card = await requestCard({
			phase,
			interaction: {
				type: 'interpret.selection',
				optionId: option.id,
				sourceCard
			}
		});
		appendAssistantCard(card);
	}

	async function fetchInspectCard(option: ProposeOption, sourceCard: ProposeCard) {
		phase = 'inspect';
		const card = await requestCard({
			phase,
			interaction: {
				type: 'propose.selection',
				optionId: option.id,
				sourceCard
			}
		});
		appendAssistantCard(card);
	}

	async function handleCardSubmit(payload: {
		messageId: string;
		cardType: string;
		choice?: ChoiceOption;
		option?: InterpretOption | ProposeOption;
	}) {
		if (payload.cardType === 'choice' && payload.choice) {
			const { choice } = payload;
			messages = [
				...messages,
				createUserTextMessage(
					`I chose: ${choice.label}${choice.description ? ` - ${choice.description}` : ''}`
				)
			];
			return;
		}

		if (payload.cardType === 'ai-interpret' && payload.option) {
			if (isRequestInFlight) return;
			isRequestInFlight = true;
			rewindToMessage(payload.messageId);

			try {
				const cardMsg = findCardMessage<InterpretCard>(payload.messageId);
				if (!cardMsg) throw new Error('Interpret card was not found');

				await persistDecision(cardMsg.spec, `Selected intent: ${payload.option.label}`);
				appendSelectionSummaryCard(payload.option, 'interpret');
				await fetchProposeCard(payload.option, cardMsg.spec);
			} catch (error) {
				console.error(error);
				messages = [...messages, createAssistantTextMessage("I couldn't commit that intent.")];
			} finally {
				isRequestInFlight = false;
			}
		}

		if (payload.cardType === 'ai-propose' && payload.option) {
			if (isRequestInFlight) return;
			isRequestInFlight = true;
			rewindToMessage(payload.messageId);

			try {
				const cardMsg = findCardMessage<ProposeCard>(payload.messageId);
				if (!cardMsg) throw new Error('Propose card was not found');

				await persistDecision(cardMsg.spec, `Selected path: ${payload.option.label}`);
				appendSelectionSummaryCard(payload.option, 'propose');
				await fetchInspectCard(payload.option, cardMsg.spec);
			} catch (error) {
				console.error(error);
				messages = [...messages, createAssistantTextMessage("I couldn't commit that path.")];
			} finally {
				isRequestInFlight = false;
			}
		}
	}

	async function handleAccept(card: AnyCard) {
		if (isRequestInFlight || card.kind === 'selection-summary' || isCardAccepted(card)) return;
		isRequestInFlight = true;

		try {
			const parentId =
				card.id in candidateParentIds ? candidateParentIds[card.id] : ($head?.id ?? null);
			await persistDecision(card, `Accepted ${card.kind}: ${card.title}`, parentId);
			delete candidateParentIds[card.id];
			messages = [...messages, createUserTextMessage(`Accept "${card.title}"`)];
		} catch (error) {
			console.error(error);
			messages = [...messages, createAssistantTextMessage("I couldn't accept that card.")];
		} finally {
			isRequestInFlight = false;
		}
	}

	function handleRefine(card: AnyCard) {
		refiningCard = card;
	}

	async function handleRefineApply(instructions: string) {
		if (!refiningCard || isRequestInFlight) return;
		isRequestInFlight = true;
		const cardToRefine = refiningCard;
		refiningCard = null;

		try {
			messages = [
				...messages,
				createUserTextMessage(`Refine "${cardToRefine.title}": ${instructions}`)
			];
			const candidateParentId = parentIdForCandidate(cardToRefine);
			const card = await requestCard({
				phase: 'refine',
				interaction: {
					type: 'refine',
					sourceCard: cardToRefine,
					instructions
				}
			});
			candidateParentIds[card.id] = candidateParentId;
			appendAssistantCard(card);
		} catch (error) {
			console.error(error);
			messages = [...messages, createAssistantTextMessage("I couldn't refine the card just now.")];
		} finally {
			isRequestInFlight = false;
		}
	}

	async function handleFork(card: AnyCard) {
		if (isRequestInFlight) return;
		isRequestInFlight = true;

		try {
			messages = [...messages, createUserTextMessage(`Fork "${card.title}"`)];
			const candidateParentId = parentIdForCandidate(card);
			const forkedCard = await requestCard({
				phase: 'fork',
				interaction: {
					type: 'fork',
					sourceCard: card
				}
			});
			candidateParentIds[forkedCard.id] = candidateParentId;
			appendAssistantCard(forkedCard);
		} catch (error) {
			console.error(error);
			messages = [...messages, createAssistantTextMessage("I couldn't fork the card just now.")];
		} finally {
			isRequestInFlight = false;
		}
	}
</script>

{#snippet ThreadActions()}
	<Button variant="secondary" onclick={injectSampleInterpretCard}
		>Inject sample interpret card</Button
	>
{/snippet}

<div class="app-shell" data-theme="cerberus">
	<h1 class="sr-only">Collabassist</h1>
	<Sidebar>
		{#snippet footer()}
			<ChatComposer>
				<div class="composer-row">
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
						aria-label="Send prompt"
						title="Send prompt"
						disabled={!draft.trim() || isRequestInFlight}
						onclick={sendMessage}
						class="send-button"
					>
						{#if isRequestInFlight}
							<LoaderCircle size={16} class="animate-spin" aria-hidden="true" />
						{:else}
							<SendHorizontal size={16} aria-hidden="true" />
						{/if}
					</Button>
				</div>
			</ChatComposer>
		{/snippet}

		<div class="workspace-brand">
			<div>
				<p>Collabassist</p>
				<span>Product spec workspace</span>
			</div>
			<div class="project-controls">
				<label>
					<span class="sr-only">Active project</span>
					<select value={activeProject.id} onchange={handleProjectChange}>
						{#each projects as project (project.id)}
							<option value={project.id}>{project.title}</option>
						{/each}
					</select>
				</label>
				<Button
					variant="secondary"
					size="sm"
					aria-label="Create project"
					title="Create project"
					onclick={createProject}
					class="new-project-button"
				>
					<Plus size={15} aria-hidden="true" />
				</Button>
			</div>
		</div>

		<ChatThread actions={ThreadActions}>
			{#each messages as message (message.id)}
				<MessageView
					{message}
					onCardSubmit={handleCardSubmit}
					onAccept={handleAccept}
					onRefine={handleRefine}
					onFork={handleFork}
					{isCardAccepted}
				/>
			{/each}
		</ChatThread>
	</Sidebar>

	<Canvas>
		{#snippet rail()}
			<PlanningPanel onHeadChange={handleHeadChange} />
		{/snippet}

		{#if refiningCard}
			<RefinePanel
				card={refiningCard}
				onClose={() => (refiningCard = null)}
				onApply={handleRefineApply}
			/>
		{:else}
			<InspectArtifactCard artifact={activeArtifact} />
		{/if}
	</Canvas>
</div>

<style>
	.app-shell {
		color-scheme: light;
		display: grid;
		height: 100vh;
		grid-template-columns: minmax(0, 1fr);
		overflow: hidden;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-50, white) 98%, var(--color-primary-500, #2563eb) 2%),
			var(--color-surface-100, #f4f4f5)
		);
		color: var(--color-surface-900);
	}

	.workspace-brand {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
		padding-bottom: 0.85rem;
		border-bottom: 1px solid color-mix(in srgb, var(--color-surface-200, #e4e4e7) 72%, transparent);
	}

	.workspace-brand > div:first-child {
		min-width: 0;
	}

	.workspace-brand p {
		margin: 0;
		font-size: 0.98rem;
		font-weight: 700;
		letter-spacing: 0;
		color: var(--color-surface-900);
	}

	.workspace-brand span {
		flex-shrink: 0;
		font-size: 0.72rem;
		font-weight: 650;
		color: color-mix(
			in srgb,
			var(--color-surface-500, #71717a) 86%,
			var(--color-primary-500, #2563eb)
		);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.project-controls {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.4rem;
	}

	.project-controls label {
		min-width: 0;
	}

	.project-controls select {
		max-width: 11rem;
		border: 1px solid color-mix(in srgb, var(--color-surface-300, #d4d4d8) 72%, transparent);
		border-radius: 999px;
		background-color: color-mix(in srgb, var(--color-surface-50, white) 92%, transparent);
		padding: 0.34rem 1.85rem 0.34rem 0.7rem;
		color: var(--color-surface-900);
		font-size: 0.72rem;
		font-weight: 650;
	}

	:global(.new-project-button) {
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		padding: 0 !important;
	}

	.composer-row {
		display: flex;
		align-items: end;
		gap: 0.55rem;
	}

	:global(.send-button) {
		margin-bottom: 0.1rem;
		display: flex;
		height: 2rem;
		width: 2rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		padding: 0 !important;
	}

	@media (min-width: 1024px) {
		.app-shell {
			grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
		}
	}
</style>
