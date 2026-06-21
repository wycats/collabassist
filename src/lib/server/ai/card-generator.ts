import { generateText, Output } from 'ai';
import { env } from '$env/dynamic/private';
import {
	anyCardSchema,
	errorCardSchema,
	inspectCardSchema,
	interpretCardSchema,
	lensCardSchema,
	mockupCardSchema,
	proposeCardSchema,
	type CardGenerationSchema
} from '$lib/ai/schemas';
import type {
	AnyCard,
	ErrorCard,
	InterpretCard,
	LensCard,
	MockupCard,
	ProposeCard
} from '$lib/cards/types';
import type { DecisionNode } from '$lib/domain/decisions-store';

type ChatMessage = {
	role: string;
	content: string;
};

export type CardGenerationPhase = 'discover' | 'shape' | 'inspect' | 'refine' | 'fork' | 'error';

export type CardInteraction =
	| { type: 'interpret.selection'; optionId: string; sourceCard?: AnyCard }
	| { type: 'propose.selection'; optionId: string; sourceCard?: AnyCard }
	| { type: 'refine'; sourceCard: AnyCard; instructions: string }
	| { type: 'fork'; sourceCard: AnyCard };

export type CardGenerationRequest = {
	projectId?: string;
	seedPrompt?: string | null;
	currentArtifactSummary?: string | null;
	messages: ChatMessage[];
	phase: CardGenerationPhase;
	activePath: DecisionNode[];
	interaction?: CardInteraction;
};

type GeneratorMode = 'fake' | 'gateway';

const FLOW_ID = 'stabilized-loop';

const INTERPRET_OPTIONS: InterpretCard['options'] = [
	{
		id: 'user-problem',
		label: 'Clarify the user problem',
		summary: 'Name the target user, job to be done, pain, and success signal.'
	},
	{
		id: 'product-scope',
		label: 'Frame the product scope',
		summary: 'Decide what belongs in the first useful feature slice and what stays out.'
	},
	{
		id: 'experience-shape',
		label: 'Shape the experience',
		summary: 'Focus on screens, interaction flow, and what the user should inspect first.'
	}
];

const PROPOSE_OPTIONS: ProposeCard['options'] = [
	{
		id: 'brief-first',
		label: 'Brief first',
		summary: 'Create a crisp feature brief before sketching the UX surface.'
	},
	{
		id: 'mockup-first',
		label: 'Mockup first',
		summary: 'Sketch the product surface and let the brief explain the layout decisions.'
	},
	{
		id: 'workflow-first',
		label: 'Workflow first',
		summary: 'Map the main user journey, then pin the brief and mockup around that flow.'
	}
];

export async function generateCard(request: CardGenerationRequest): Promise<AnyCard> {
	const mode = getGeneratorMode();

	try {
		if (mode === 'gateway') {
			return await generateGatewayCard(request);
		}

		return generateFakeCard(request);
	} catch (error) {
		console.error('Card generation failed:', error);
		return createErrorCard(
			'model_uncertain',
			'I could not generate a valid structured card for this step.',
			'Try again, simplify the request, or switch back to deterministic fake mode.'
		);
	}
}

function getGeneratorMode(): GeneratorMode {
	return env.CARD_GENERATOR_MODE === 'gateway' ? 'gateway' : 'fake';
}

function generateFakeCard(request: CardGenerationRequest): AnyCard {
	const { phase, interaction, messages } = request;
	const latestMessage = messages.at(-1)?.content ?? 'Design a product spec workflow.';

	if (phase === 'refine' && interaction?.type === 'refine') {
		return refineCard(interaction.sourceCard, interaction.instructions);
	}

	if (phase === 'fork' && interaction?.type === 'fork') {
		return forkCard(interaction.sourceCard);
	}

	if (phase === 'shape') {
		return {
			id: crypto.randomUUID(),
			kind: 'propose',
			title: 'Choose a product shape',
			description: 'Pick the structure that should carry the next inspection pass.',
			flowId: FLOW_ID,
			stepIndex: 1,
			options: PROPOSE_OPTIONS
		};
	}

	if (phase === 'inspect') {
		const optionId = interaction?.type === 'propose.selection' ? interaction.optionId : undefined;
		return inspectCardFor(optionId);
	}

	return {
		id: crypto.randomUUID(),
		kind: 'interpret',
		title: 'What should we clarify first?',
		description: `I read this as a product-spec request: "${latestMessage}". Pick the axis that matters most.`,
		flowId: FLOW_ID,
		stepIndex: 0,
		options: INTERPRET_OPTIONS
	};
}

async function generateGatewayCard(request: CardGenerationRequest): Promise<AnyCard> {
	const schema = schemaFor(request);
	const { output } = await generateText({
		model: env.AI_GATEWAY_MODEL ?? 'anthropic/claude-sonnet-4.6',
		system: SYSTEM_PROMPT,
		prompt: buildGatewayPrompt(request),
		output: Output.object({ schema })
	});

	const card = output as AnyCard;
	return anyCardSchema.parse(card);
}

function schemaFor(request: CardGenerationRequest): CardGenerationSchema {
	const { phase, interaction } = request;

	if (phase === 'shape') return proposeCardSchema;
	if (phase === 'inspect') return inspectCardSchema;
	if (phase === 'refine' || phase === 'fork') {
		const sourceCard =
			interaction?.type === 'refine' || interaction?.type === 'fork'
				? interaction.sourceCard
				: undefined;
		if (sourceCard?.kind === 'interpret') return interpretCardSchema;
		if (sourceCard?.kind === 'propose') return proposeCardSchema;
		if (sourceCard?.kind === 'mockup') return mockupCardSchema;
		if (sourceCard?.kind === 'lens') return lensCardSchema;
		if (sourceCard?.kind === 'error') return errorCardSchema;
		return anyCardSchema;
	}

	return interpretCardSchema;
}

function buildGatewayPrompt(request: CardGenerationRequest): string {
	const activePath = request.activePath
		.map((node, index) => `${index + 1}. ${node.summary ?? node.cardSnapshot.title}`)
		.join('\n');
	const messages = request.messages
		.map((message) => `${message.role}: ${message.content}`)
		.join('\n');

	return `
Phase: ${request.phase}
Project id: ${request.projectId ?? 'unassigned'}
Seed prompt: ${request.seedPrompt ?? 'None yet.'}
Current artifact summary: ${request.currentArtifactSummary ?? 'No pinned artifact yet.'}

Accepted decisions:
${activePath || 'None yet.'}

Recent messages:
${messages || 'No recent messages.'}

Interaction:
${JSON.stringify(request.interaction ?? null, null, 2)}

Return exactly one card. Include an id, kind, title, concise description, and all required fields for that kind.
Use option summaries that are concrete enough to show in the UI.
`;
}

const SYSTEM_PROMPT = `
You are CollabAssist, a card-first AI partner for turning fuzzy product ideas into durable product specs.
Your output is structured data, not prose.

Use these card kinds:
- interpret: clarify ambiguous product intent with 2-5 options.
- propose: offer 2-5 concrete product-spec directions after intent is clear.
- mockup: describe a low-fidelity product surface using regions.
- lens: expose users, entities, flows, screens, or permissions as structured sections.
- error: ask for missing information or recover from uncertainty.

Treat the Decisions Rail as committed context. Do not contradict it without explicitly creating a forked alternative.
Help the user produce a resumable product-spec artifact with a brief plus inspectable mockup or lens data.
`;

function inspectCardFor(optionId: string | undefined): MockupCard | LensCard {
	if (optionId === 'mockup-first') {
		return {
			id: crypto.randomUUID(),
			kind: 'mockup',
			title: 'Product surface sketch',
			description: 'A first-pass product surface that makes the core value proposition visible.',
			flowId: FLOW_ID,
			stepIndex: 2,
			regions: [
				{
					id: 'nav-rail',
					label: 'Navigation and context',
					layout: 'library',
					role: 'sidebar',
					notes: 'Project context, primary sections, and the next best action.'
				},
				{
					id: 'value-band',
					label: 'Value proposition band',
					layout: 'shelf',
					role: 'switcher',
					notes: 'The promise, target user, and proof that the feature is working.'
				},
				{
					id: 'workflow-grid',
					label: 'Workflow grid',
					layout: 'bookcase',
					role: 'content',
					notes: 'Core tasks, important states, and the user choices that matter.'
				},
				{
					id: 'focus-panel',
					label: 'Focused artifact panel',
					layout: 'library',
					role: 'content',
					notes: 'The selected object, rationale, and follow-up refinement controls.'
				}
			]
		};
	}

	if (optionId === 'workflow-first') {
		return {
			id: crypto.randomUUID(),
			kind: 'mockup',
			title: 'Workflow-led product sketch',
			description:
				'A product surface organized around the primary user journey and its decision points.',
			flowId: FLOW_ID,
			stepIndex: 2,
			regions: [
				{
					id: 'journey-sidebar',
					label: 'Journey sidebar',
					layout: 'library',
					role: 'sidebar',
					notes: 'The workflow steps, saved branches, and artifact checkpoints.'
				},
				{
					id: 'decision-strip',
					label: 'Decision strip',
					layout: 'shelf',
					role: 'switcher',
					notes: 'Current path, branch switcher, and accept/refine/fork moves.'
				},
				{
					id: 'artifact-canvas',
					label: 'Artifact canvas',
					layout: 'library',
					role: 'content',
					notes: 'The brief and mockup stay visible while the next step is refined.'
				}
			]
		};
	}

	if (optionId === 'brief-first') {
		return {
			id: crypto.randomUUID(),
			kind: 'mockup',
			title: 'Feature brief workspace sketch',
			description: 'A focused workspace for reviewing the brief before expanding the UI.',
			flowId: FLOW_ID,
			stepIndex: 2,
			regions: [
				{
					id: 'brief-toolbar',
					label: 'Brief toolbar',
					layout: 'shelf',
					notes: 'Project title, current status, and accept/refine/fork actions.'
				},
				{
					id: 'brief-outline',
					label: 'Brief outline',
					layout: 'bookcase',
					notes: 'Problem, audience, scope, non-goals, and success criteria.'
				},
				{
					id: 'detail-panel',
					label: 'Mockup preview panel',
					layout: 'library',
					notes: 'A lightweight visual companion to the accepted product brief.'
				}
			]
		};
	}

	return {
		id: crypto.randomUUID(),
		kind: 'lens',
		title: 'Product spec model lens',
		description: 'The durable objects implied by the selected product-spec direction.',
		flowId: FLOW_ID,
		stepIndex: 2,
		lensType: 'entities',
		payload: {
			sections: [
				{
					id: 'brief',
					label: 'Brief',
					contents: ['Problem', 'Target user', 'Scope', 'Success criteria']
				},
				{
					id: 'decisions',
					label: 'Decisions',
					contents: ['Accepted intent', 'Selected product shape', 'Branch head']
				},
				{
					id: 'artifacts',
					label: 'Artifacts',
					contents: ['Pinned product spec', 'Inspectable mockup or lens', 'Future revision path']
				}
			],
			callsToAction: ['Accept the inspect card', 'Refine the brief', 'Fork another product shape']
		}
	};
}

function refineCard(card: AnyCard, instructions: string): AnyCard {
	const description = `${card.description ?? 'Refined card.'} Refinement: ${instructions}`;
	return {
		...card,
		id: crypto.randomUUID(),
		title: `${card.title} v2`,
		description
	} as AnyCard;
}

function forkCard(card: AnyCard): AnyCard {
	const description = `Alternative branch from "${card.title}" with a different assumption set.`;

	if (card.kind === 'interpret') {
		return {
			...card,
			id: crypto.randomUUID(),
			title: 'Alternative interpretation set',
			description,
			options: [
				{
					id: 'constraints',
					label: 'Start from constraints',
					summary: 'Clarify time, team, user data, and launch risk boundaries first.'
				},
				{
					id: 'brief',
					label: 'Start from the brief',
					summary: 'Name the product-spec artifact before choosing screens.'
				},
				{
					id: 'workflow',
					label: 'Start from workflow',
					summary: 'Model the human and AI moves before choosing screens.'
				}
			]
		};
	}

	if (card.kind === 'propose') {
		return {
			...card,
			id: crypto.randomUUID(),
			title: 'Alternative product shapes',
			description,
			options: [
				{
					id: 'brief-first',
					label: 'Brief first',
					summary: 'Organize the artifact as a feature brief with decisions attached.'
				},
				{
					id: 'mockup-first',
					label: 'Mockup first',
					summary: 'Use the product surface as the main comparison object.'
				},
				{
					id: 'workflow-first',
					label: 'Workflow first',
					summary: 'Center the user journey and pin the artifact around it.'
				}
			]
		};
	}

	return {
		...card,
		id: crypto.randomUUID(),
		title: `Fork: ${card.title}`,
		description
	} as AnyCard;
}

export function createErrorCard(
	errorKind: ErrorCard['errorKind'],
	details: string,
	recoveryHint?: string
): ErrorCard {
	return {
		id: crypto.randomUUID(),
		kind: 'error',
		title: 'Card generation needs attention',
		description: 'The assistant could not complete this structured step safely.',
		flowId: FLOW_ID,
		errorKind,
		details,
		recoveryHint
	};
}
