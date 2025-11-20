import { writable, derived, get } from 'svelte/store';
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
	const decisions = writable<DecisionNode[]>([]);
	const headId = writable<string | null>(null);

	const activePath = derived([decisions, headId], ([$decisions, $headId]) => {
		if (!$headId) {
			// If no head is selected, default to the last added node (temporal tail)
			// This is a heuristic; ideally we persist the active head.
			if ($decisions.length === 0) return [];
			// Find the node that is not a parent to anyone? No, that could be multiple tips.
			// For now, let's just pick the last one in the list as the default head.
			const last = $decisions[$decisions.length - 1];
			return getPath($decisions, last.id);
		}
		return getPath($decisions, $headId);
	});

	return {
		subscribe: decisions.subscribe,
		set: (nodes: DecisionNode[]) => {
			decisions.set(nodes);
			// Auto-set head to the last node if not set
			if (nodes.length > 0) {
				headId.set(nodes[nodes.length - 1].id);
			}
		},
		add: (decision: DecisionNode) => {
			decisions.update((nodes) => [...nodes, decision]);
			headId.set(decision.id);
		},
		reset: () => {
			decisions.set([]);
			headId.set(null);
		},
		activePath,
		headId
	};
}

function getPath(nodes: DecisionNode[], headId: string): DecisionNode[] {
	const path: DecisionNode[] = [];
	let currentId: string | null = headId;
	while (currentId) {
		const node = nodes.find((d) => d.id === currentId);
		if (!node) break;
		path.unshift(node);
		currentId = node.parentId;
	}
	return path;
}

export const decisions = createDecisionsStore();
