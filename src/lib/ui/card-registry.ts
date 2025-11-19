// src/lib/ui/card-registry.ts
import ChoiceCard from '$lib/cards/ChoiceCard.svelte';
import InterpretCard from '$lib/cards/InterpretCard.svelte';
import ProposeCard from '$lib/cards/ProposeCard.svelte';
import SelectionSummaryCard from '$lib/cards/SelectionSummaryCard.svelte';
import LensCard from '$lib/cards/LensCard.svelte';
import MockupCard from '$lib/cards/MockupCard.svelte';

export const cardRegistry = {
	choice: ChoiceCard,
	'ai-interpret': InterpretCard,
	'ai-propose': ProposeCard,
	'ai-lens': LensCard,
	'ai-mockup': MockupCard,
	'selection-summary': SelectionSummaryCard
} as const;
