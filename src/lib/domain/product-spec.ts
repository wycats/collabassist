import type { AnyCard, LensCard, MockupCard } from '$lib/cards/types';
import type { DecisionNode } from '$lib/domain/decisions-store';
import type {
	InspectArtifactCard,
	ProductSpecArtifactData,
	ProductSpecBrief
} from '$lib/domain/artifact';

export function isInspectArtifactCard(card: AnyCard): card is InspectArtifactCard {
	return card.kind === 'mockup' || card.kind === 'lens';
}

export function buildProductSpecArtifactData(input: {
	projectTitle: string;
	seedPrompt: string | null;
	decisions: DecisionNode[];
	inspectCard: InspectArtifactCard;
	sourceDecisionId: string;
	now: string;
}): ProductSpecArtifactData {
	const intent = latestSummaryFor(input.decisions, 'interpret');
	const path = latestSummaryFor(input.decisions, 'propose');
	const acceptedDecisions = input.decisions.map((decision) =>
		decision.summary ? decision.summary : decision.cardSnapshot.title
	);
	const brief = buildBrief({
		projectTitle: input.projectTitle,
		seedPrompt: input.seedPrompt,
		intent,
		path,
		acceptedDecisions,
		inspectCard: input.inspectCard
	});

	return {
		kind: 'product-spec',
		brief,
		inspectCard: input.inspectCard,
		branchHeadId: input.sourceDecisionId,
		sourceCardId: input.inspectCard.id,
		updatedAt: input.now
	};
}

function buildBrief(input: {
	projectTitle: string;
	seedPrompt: string | null;
	intent: string | null;
	path: string | null;
	acceptedDecisions: string[];
	inspectCard: MockupCard | LensCard;
}): ProductSpecBrief {
	const title =
		input.projectTitle.trim() || titleFromPrompt(input.seedPrompt) || input.inspectCard.title;
	const summaryParts = [
		input.seedPrompt ? `Seed idea: ${input.seedPrompt}` : null,
		input.intent,
		input.path,
		input.inspectCard.description ?? input.inspectCard.title
	].filter(Boolean);

	return {
		title,
		intent: input.intent,
		path: input.path,
		summary: summaryParts.join(' '),
		acceptedDecisions: input.acceptedDecisions,
		openQuestions: openQuestionsFor(input.inspectCard)
	};
}

function latestSummaryFor(decisions: DecisionNode[], kind: 'interpret' | 'propose') {
	const decision = decisions
		.slice()
		.reverse()
		.find((candidate) => candidate.cardSnapshot.kind === kind);

	return decision?.summary ?? decision?.cardSnapshot.title ?? null;
}

function titleFromPrompt(prompt: string | null) {
	if (!prompt) return null;
	const words = prompt
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.split(/\s+/)
		.slice(0, 6);

	if (words.length === 0) return null;
	return words.join(' ');
}

function openQuestionsFor(card: MockupCard | LensCard) {
	if (card.kind === 'mockup') {
		return [
			'Which user role should the first screen optimize for?',
			'What data should populate the primary mockup regions?'
		];
	}

	return [
		'Which entities or flows need stricter product constraints?',
		'What should become editable in the next artifact revision?'
	];
}
