import { writable } from 'svelte/store';
import type { AnyCard } from '$lib/cards/types';

export interface DecisionNode {
	id: string;
	cardId: string;
	parentId: string | null;
	acceptedAt: Date;
	summary: string | null;
	cardSnapshot: AnyCard;
}

function createDecisionsStore() {
	const { subscribe, set, update } = writable<DecisionNode[]>([]);

	return {
		subscribe,
		set,
		add: (decision: DecisionNode) => update((nodes) => [...nodes, decision]),
		reset: () => set([])
	};
}

export const decisions = createDecisionsStore();
