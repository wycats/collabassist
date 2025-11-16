// src/lib/cards/types.ts
// Canonical card model used across the AI UX pipeline.

export type CardKind = 'interpret' | 'propose' | 'mockup' | 'lens' | 'error';

export interface CardBase {
	id: string;
	kind: CardKind;
	title: string;
	description?: string;
	flowId?: string;
	stepIndex?: number;
}

export interface InterpretOption {
	id: string;
	label: string;
	summary: string;
}

export interface InterpretCard extends CardBase {
	kind: 'interpret';
	options: InterpretOption[];
}

export interface ProposeOption {
	id: string;
	label: string;
	summary: string;
}

export interface ProposeCard extends CardBase {
	kind: 'propose';
	options: ProposeOption[];
}

export type MockupLayout = 'shelf' | 'bookcase' | 'library';

export interface MockupRegion {
	id: string;
	label: string;
	layout: MockupLayout;
	notes?: string;
}

export interface MockupCard extends CardBase {
	kind: 'mockup';
	regions: MockupRegion[];
}

export type LensType = 'entities' | 'flows' | 'screens' | 'permissions';

export interface LensCard extends CardBase {
	kind: 'lens';
	lensType: LensType;
	payload: unknown;
}

export type ErrorKind = 'missing_info' | 'model_uncertain' | 'invalid_state';

export interface ErrorCard extends CardBase {
	kind: 'error';
	errorKind: ErrorKind;
	details?: string;
	recoveryHint?: string;
}

export type AnyCard = InterpretCard | ProposeCard | MockupCard | LensCard | ErrorCard;

// Utility guard helpers make it easy to branch on card types in Svelte.
export function isCardKind<TKind extends CardKind>(card: AnyCard, kind: TKind): card is Extract<AnyCard, { kind: TKind }> {
	return card.kind === kind;
}
