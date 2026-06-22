import { describe, expect, it } from 'vitest';
import { buildProductSpecArtifactData } from './product-spec';
import type { DecisionNode } from './decisions-store';
import type { AnyCard, InterpretCard, MockupCard, ProposeCard } from '$lib/cards/types';

const interpretCard: InterpretCard = {
	id: 'card-interpret',
	kind: 'interpret',
	title: 'Clarify product intent',
	options: [
		{
			id: 'user-problem',
			label: 'Clarify the user problem',
			summary: 'Name the target user and pain.'
		},
		{
			id: 'product-scope',
			label: 'Frame the product scope',
			summary: 'Decide the first useful slice.'
		}
	]
};

const proposeCard: ProposeCard = {
	id: 'card-propose',
	kind: 'propose',
	title: 'Choose product shape',
	options: [
		{
			id: 'brief-first',
			label: 'Brief first',
			summary: 'Create a crisp feature brief.'
		},
		{
			id: 'mockup-first',
			label: 'Mockup first',
			summary: 'Sketch the surface first.'
		}
	]
};

const mockupCard: MockupCard = {
	id: 'card-mockup',
	kind: 'mockup',
	title: 'Product surface sketch',
	description: 'A first-pass product surface.',
	regions: [
		{
			id: 'value-band',
			label: 'Value proposition band',
			layout: 'shelf'
		}
	]
};

describe('product spec artifact builder', () => {
	it('builds a stable product spec artifact from accepted decisions and an inspect card', () => {
		const data = buildProductSpecArtifactData({
			projectTitle: 'Team roadmap assistant',
			seedPrompt: 'Help teams decide what to build next',
			decisions: [
				decision(
					'decision-interpret',
					null,
					interpretCard,
					'Selected intent: Clarify user problem'
				),
				decision(
					'decision-propose',
					'decision-interpret',
					proposeCard,
					'Selected path: Brief first'
				),
				decision('decision-mockup', 'decision-propose', mockupCard, 'Accepted mockup')
			],
			inspectCard: mockupCard,
			sourceDecisionId: 'decision-mockup',
			now: '2026-06-20T12:00:00.000Z'
		});

		expect(data.kind).toBe('product-spec');
		expect(data.branchHeadId).toBe('decision-mockup');
		expect(data.sourceCardId).toBe(mockupCard.id);
		expect(data.brief.title).toBe('Team roadmap assistant');
		expect(data.brief.intent).toBe('Selected intent: Clarify user problem');
		expect(data.brief.path).toBe('Selected path: Brief first');
		expect(data.brief.acceptedDecisions).toEqual([
			'Selected intent: Clarify user problem',
			'Selected path: Brief first',
			'Accepted mockup'
		]);
		expect(data.inspectCard).toEqual(mockupCard);
	});
});

function decision(
	id: string,
	parentId: string | null,
	cardSnapshot: AnyCard,
	summary: string
): DecisionNode {
	return {
		id,
		projectId: 'project-alpha',
		parentId,
		artifactId: null,
		cardId: cardSnapshot.id,
		acceptedAt: '2026-06-20T12:00:00.000Z',
		summary,
		cardSnapshot
	};
}
