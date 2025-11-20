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
			if ($decisions.length === 0) return [];
			const last = $decisions[$decisions.length - 1];
			return getPath($decisions, last.id);
		}
		return getPath($decisions, $headId);
	});

	const heads = derived(decisions, ($decisions) => {
		if ($decisions.length === 0) return [];
		// A head is a node that is not a parent to any other node
		const parentIds = new Set($decisions.map((d) => d.parentId).filter(Boolean));
		return $decisions.filter((d) => !parentIds.has(d.id));
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
		setHead: (id: string) => {
			headId.set(id);
		},
		activePath,
		headId,
		heads
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
