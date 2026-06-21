import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { generateCard, type CardGenerationPhase } from '$lib/server/ai/card-generator';
import { anyCardSchema } from '$lib/ai/schemas';
import type { RequestHandler } from './$types';

const requestSchema = z.object({
	projectId: z.string().optional(),
	seedPrompt: z.string().nullable().optional(),
	currentArtifactSummary: z.string().nullable().optional(),
	messages: z
		.array(
			z.object({
				role: z.string(),
				content: z.string()
			})
		)
		.default([]),
	phase: z.enum(['discover', 'shape', 'inspect', 'refine', 'fork', 'error']).default('discover'),
	activePath: z.array(z.unknown()).default([]),
	interaction: z
		.object({
			type: z.string(),
			optionId: z.string().optional(),
			sourceCard: anyCardSchema.optional(),
			instructions: z.string().optional()
		})
		.optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.json().catch(() => undefined);
	const parsed = requestSchema.safeParse(rawBody ?? {});

	if (!parsed.success) {
		return json(
			{
				id: crypto.randomUUID(),
				kind: 'error',
				title: 'Invalid card request',
				description: 'The app sent a request the card generator could not understand.',
				errorKind: 'invalid_state',
				details: parsed.error.issues.map((issue) => issue.message).join('; '),
				recoveryHint: 'Reload the page and try the action again.'
			},
			{ status: 200 }
		);
	}

	const body = parsed.data;
	const card = await generateCard({
		projectId: body.projectId,
		seedPrompt: body.seedPrompt ?? null,
		currentArtifactSummary: body.currentArtifactSummary ?? null,
		messages: body.messages,
		phase: body.phase as CardGenerationPhase,
		activePath: body.activePath as never[],
		interaction: normalizeInteraction(body.interaction)
	});

	return json(card);
};

function normalizeInteraction(bodyInteraction: z.infer<typeof requestSchema>['interaction']) {
	if (!bodyInteraction) return undefined;

	if (bodyInteraction.type === 'interpret.selection' && bodyInteraction.optionId) {
		return {
			type: 'interpret.selection' as const,
			optionId: bodyInteraction.optionId,
			sourceCard: bodyInteraction.sourceCard
		};
	}

	if (bodyInteraction.type === 'propose.selection' && bodyInteraction.optionId) {
		return {
			type: 'propose.selection' as const,
			optionId: bodyInteraction.optionId,
			sourceCard: bodyInteraction.sourceCard
		};
	}

	if (
		bodyInteraction.type === 'refine' &&
		bodyInteraction.sourceCard &&
		bodyInteraction.instructions
	) {
		return {
			type: 'refine' as const,
			sourceCard: bodyInteraction.sourceCard,
			instructions: bodyInteraction.instructions
		};
	}

	if (bodyInteraction.type === 'fork' && bodyInteraction.sourceCard) {
		return {
			type: 'fork' as const,
			sourceCard: bodyInteraction.sourceCard
		};
	}

	return undefined;
}
