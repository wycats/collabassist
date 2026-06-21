import { get } from 'svelte/store';
import { afterEach, describe, expect, it } from 'vitest';
import { decisions, type DecisionNode } from './decisions-store';
import type { AnyCard, InterpretCard } from '$lib/cards/types';

const baseCard = {
	kind: 'interpret',
	title: 'Clarify intent',
	options: [
		{
			id: 'flows',
			label: 'Shape the flows',
			summary: 'Trace user journeys, decision points, and recovery states.'
		},
		{
			id: 'screens',
			label: 'Sketch main screens',
			summary: 'Map the primary surfaces, navigation, and working layout.'
		}
	]
} satisfies Omit<InterpretCard, 'id'>;

afterEach(() => {
	decisions.reset();
});

describe('decisions store', () => {
	it('tracks the selected branch head instead of the last inserted node', () => {
		const root = decision('root', null, {
			...baseCard,
			id: 'card-root',
			title: 'Root intent'
		});
		const firstBranch = decision('branch-a', root.id, {
			...baseCard,
			id: 'card-a',
			title: 'Accepted branch A'
		});
		const secondBranch = decision('branch-b', root.id, {
			...baseCard,
			id: 'card-b',
			title: 'Accepted branch B'
		});

		decisions.set([root, firstBranch, secondBranch]);
		decisions.setHead(firstBranch.id);

		expect(get(decisions.head)?.id).toBe(firstBranch.id);
		expect(get(decisions.activePath).map((node) => node.id)).toEqual([root.id, firstBranch.id]);
		expect(get(decisions.heads).map((node) => node.id)).toEqual([firstBranch.id, secondBranch.id]);
	});

	it('moves the head to newly accepted child decisions', () => {
		const root = decision('root', null, {
			...baseCard,
			id: 'card-root',
			title: 'Root intent'
		});
		const child = decision('child', root.id, {
			...baseCard,
			id: 'card-child',
			title: 'Accepted child'
		});

		decisions.set([root]);
		decisions.add(child);

		expect(get(decisions.head)?.id).toBe(child.id);
		expect(get(decisions.activePath).map((node) => node.id)).toEqual([root.id, child.id]);
	});
});

function decision(id: string, parentId: string | null, cardSnapshot: AnyCard): DecisionNode {
	return {
		id,
		projectId: 'project-alpha',
		parentId,
		artifactId: null,
		cardId: cardSnapshot.id,
		acceptedAt: '2026-06-19T00:00:00.000Z',
		summary: cardSnapshot.title,
		cardSnapshot
	};
}
