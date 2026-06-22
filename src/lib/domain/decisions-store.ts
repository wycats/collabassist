import { writable, derived } from 'svelte/store';
import type { AnyCard } from '$lib/cards/types';

export interface DecisionNode {
	id: string;
	projectId: string;
	cardId: string;
	parentId: string | null;
	artifactId: string | null;
	acceptedAt: string;
	summary: string | null;
	cardSnapshot: AnyCard;
}

type RawDecisionNode = Omit<DecisionNode, 'acceptedAt'> & { acceptedAt: string | Date };

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

	const head = derived([decisions, headId], ([$decisions, $headId]) => {
		if ($decisions.length === 0) return null;
		const selectedId = $headId ?? $decisions[$decisions.length - 1].id;
		return $decisions.find((decision) => decision.id === selectedId) ?? null;
	});

	const heads = derived(decisions, ($decisions) => {
		if ($decisions.length === 0) return [];
		// A head is a node that is not a parent to any other node
		const parentIds = new Set($decisions.map((d) => d.parentId).filter(Boolean));
		return $decisions.filter((d) => !parentIds.has(d.id));
	});

	return {
		subscribe: decisions.subscribe,
		set: (nodes: RawDecisionNode[], selectedHeadId?: string | null) => {
			const normalized = nodes.map(normalizeNode);
			decisions.set(normalized);
			if (selectedHeadId && normalized.some((node) => node.id === selectedHeadId)) {
				headId.set(selectedHeadId);
				return;
			}
			if (normalized.length > 0) {
				headId.set(normalized[normalized.length - 1].id);
				return;
			}
			headId.set(null);
		},
		add: (decision: DecisionNode) => {
			const normalized = normalizeNode(decision);
			decisions.update((nodes) => [...nodes, normalized]);
			headId.set(normalized.id);
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
		head,
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

function normalizeNode(node: RawDecisionNode): DecisionNode {
	return {
		...node,
		acceptedAt:
			node.acceptedAt instanceof Date
				? node.acceptedAt.toISOString()
				: new Date(node.acceptedAt).toISOString()
	};
}

export const decisions = createDecisionsStore();
