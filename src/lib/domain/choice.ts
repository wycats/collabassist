// src/lib/domain/card.ts

// Spec for a simple choice card the assistant can show.
export interface ChoiceOption {
	id: string;
	label: string;
	description?: string;
}

export interface ChoiceCardSpec {
	prompt: string;
	options: ChoiceOption[];
	// if true, allow multiple selection (we'll start with single)
	multi?: boolean;
}
