import { writable } from 'svelte/store';

import type { Phase } from './phase';
import { INITIAL_PHASE } from './phase';
import type { InterpretOption, LensCard, MockupCard, ProposeOption } from '$lib/cards/types';

type PlanSection = {
	id: string;
	label: string;
	summary?: string;
};

type InspectSection =
	| {
			kind: 'lens';
			label: string;
			summary?: string;
			card: LensCard;
	  }
	| {
			kind: 'mockup';
			label: string;
			summary?: string;
			card: MockupCard;
	  };

export interface CurrentPlan {
	phase: Phase;
	interpret?: PlanSection;
	propose?: PlanSection;
	inspect?: InspectSection;
}

export const currentPlan = writable<CurrentPlan>({
	phase: INITIAL_PHASE
});

export function resetPlan(phase: Phase = INITIAL_PHASE) {
	currentPlan.set({ phase });
}

export function lockInterpret(option: InterpretOption, nextPhase: Phase = 'shape') {
	currentPlan.set({
		phase: nextPhase,
		interpret: {
			id: option.id,
			label: option.label,
			summary: option.summary
		}
	});
}

export function lockPropose(option: ProposeOption, nextPhase: Phase = 'inspect') {
	currentPlan.update((plan) => ({
		phase: nextPhase,
		interpret: plan.interpret,
		propose: {
			id: option.id,
			label: option.label,
			summary: option.summary
		}
	}));
}

export function lockInspectFromLens(card: LensCard, phase: Phase = 'inspect') {
	currentPlan.update((plan) => ({
		...plan,
		phase,
		inspect: {
			kind: 'lens',
			label: card.title,
			summary: card.description,
			card
		}
	}));
}

export function lockInspectFromMockup(card: MockupCard, phase: Phase = 'inspect') {
	currentPlan.update((plan) => ({
		...plan,
		phase,
		inspect: {
			kind: 'mockup',
			label: card.title,
			summary: card.description,
			card
		}
	}));
}
