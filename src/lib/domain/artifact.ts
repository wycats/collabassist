import type { LensCard, MockupCard } from '$lib/cards/types';

export type ArtifactType =
	| 'product-spec'
	| 'doc'
	| 'canvas'
	| 'schema'
	| 'layout'
	| 'code'
	| string;
export type ArtifactCreator = 'user' | 'assistant';

export type InspectArtifactCard = MockupCard | LensCard;

export interface ProductSpecBrief {
	title: string;
	intent: string | null;
	path: string | null;
	summary: string;
	acceptedDecisions: string[];
	openQuestions: string[];
}

export interface ProductSpecArtifactData {
	kind: 'product-spec';
	brief: ProductSpecBrief;
	inspectCard: InspectArtifactCard;
	branchHeadId: string;
	sourceCardId: string;
	updatedAt: string;
}

export interface Artifact<TData = unknown> {
	id: string;
	projectId: string;
	sourceDecisionId: string;
	sourceCardId: string;
	type: ArtifactType;
	title: string;
	data: TData;
	createdAt: string;
	updatedAt: string;
	createdBy: ArtifactCreator;
}

export type ProductSpecArtifact = Artifact<ProductSpecArtifactData>;
