// src/lib/ui/card-registry.ts
import type { CardMessage } from '$lib/domain/message';
import type { SvelteComponent } from 'svelte';
import ChoiceCard from '$lib/cards/ChoiceCard.svelte';

export type CardComponent = typeof SvelteComponent<{
	message: CardMessage<any>;
	// card-specific events are handled via Svelte's component typing;
	// we keep this loose here for simplicity.
}>;

// Map cardType → component
export const cardRegistry: Record<string, CardComponent> = {
	choice: ChoiceCard
};
