import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import {
	interpretCardSchema,
	proposeCardSchema,
	mockupCardSchema,
	lensCardSchema,
	anyCardSchema
} from '$lib/ai/schemas';
import { env } from '$env/dynamic/private';

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY
});

const SYSTEM_PROMPT = `
You are CollabAssist, an advanced AI partner for software design.
Your goal is to help the user refine their ideas into concrete specifications through a structured process.

You communicate primarily through "Cards", which are structured UI elements that allow the user to make decisions.
The user's journey follows a "Rail" of decisions. You will be given the "Active Path" of decisions made so far.
Use this context to inform your next move.

Your available moves (Cards):
1. **Interpret**: When the user's intent is vague, offer 3 distinct interpretations to clarify the direction.
2. **Propose**: When the direction is clear but the solution is open, offer 3 distinct architectural or design approaches.
3. **Mockup**: When a specific approach is selected, generate a low-fidelity wireframe description (regions, layout).
4. **Lens**: When a specific aspect needs detail (e.g., data model, user flow), provide a focused view.

Always be concise, professional, and design-forward.
`;

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => undefined)) as
		| {
				messages?: { role: string; content: string }[];
				phase?: string;
				activePath?: any[]; // Context from the client
				interaction?: {
					type: string;
					optionId?: string;
					sourceCard?: any;
					instructions?: string;
				};
		  }
		| undefined;

	const phase = body?.phase ?? 'discover';
	const messages = body?.messages ?? [];
	const activePath = body?.activePath ?? [];
	const lastMessage = messages[messages.length - 1]?.content ?? '';

	// Construct context string from activePath
	const contextSummary = activePath
		.map((node: any) => `[Accepted: ${node.cardSnapshot.title}]`)
		.join(' -> ');

	const contextPrompt = `
Context (Decisions Rail):
${contextSummary || 'No decisions made yet (Start of session).'}

User Input: "${lastMessage}"
Phase: ${phase}
`;

	try {
		console.log('API Request Body:', JSON.stringify(body, null, 2));

		if (phase === 'refine') {
			const { sourceCard, instructions } = body?.interaction ?? {};
			const prompt = `
The user wants to REFINE the following card:
${JSON.stringify(sourceCard, null, 2)}

Instructions: "${instructions}"

Generate a new version of this card with the requested changes. Keep the same 'kind' and structure, but update the content.
`;
			let schema = anyCardSchema;
			if (sourceCard.kind === 'interpret') schema = interpretCardSchema as any;
			if (sourceCard.kind === 'propose') schema = proposeCardSchema as any;
			if (sourceCard.kind === 'mockup') schema = mockupCardSchema as any;
			if (sourceCard.kind === 'lens') schema = lensCardSchema as any;

			const result = await generateObject({
				model: google('gemini-1.5-flash'),
				system: SYSTEM_PROMPT,
				prompt: contextPrompt + prompt,
				schema: schema
			});

			return json({ ...result.object, id: crypto.randomUUID() });
		}

		if (phase === 'fork') {
			const { sourceCard } = body?.interaction ?? {};
			const prompt = `
The user wants to FORK from this card:
${JSON.stringify(sourceCard, null, 2)}

Generate a DISTINCT alternative to this card. It should be a sibling in the decision tree.
Explore a different direction or assumption while keeping the same 'kind'.
`;
			let schema = anyCardSchema;
			if (sourceCard.kind === 'interpret') schema = interpretCardSchema as any;
			if (sourceCard.kind === 'propose') schema = proposeCardSchema as any;
			if (sourceCard.kind === 'mockup') schema = mockupCardSchema as any;
			if (sourceCard.kind === 'lens') schema = lensCardSchema as any;

			const result = await generateObject({
				model: google('gemini-1.5-flash'),
				system: SYSTEM_PROMPT,
				prompt: contextPrompt + prompt,
				schema: schema
			});

			return json({ ...result.object, id: crypto.randomUUID() });
		}

		if (phase === 'inspect') {
			const { optionId, sourceCard } = body?.interaction ?? {};
			const prompt = `
The user selected option "${optionId}" from the previous card:
${JSON.stringify(sourceCard, null, 2)}

Based on this selection, generate the next logical step.
- If they selected a high-level direction (Interpret), move to **Propose** (architectural options).
- If they selected an approach (Propose), move to **Mockup** (wireframe).
- If they are already at Mockup, maybe move to **Lens** or another Mockup detail.

Generate the appropriate card type.
`;
			const result = await generateObject({
				model: google('gemini-1.5-flash'),
				system: SYSTEM_PROMPT,
				prompt: contextPrompt + prompt,
				schema: anyCardSchema
			});

			return json({ ...result.object, id: crypto.randomUUID() });
		}

		if (phase === 'shape') {
			const result = await generateObject({
				model: google('gemini-1.5-flash'),
				system: SYSTEM_PROMPT,
				prompt: contextPrompt + `\nGenerate a 'Propose' card with 3 distinct architectural options based on the user's input.`,
				schema: proposeCardSchema
			});
			return json({ ...result.object, id: crypto.randomUUID() });
		}

		// Default: Discover/Interpret
		const result = await generateObject({
			model: google('gemini-1.5-flash'),
			system: SYSTEM_PROMPT,
			prompt: contextPrompt + `\nGenerate an 'Interpret' card with 3 distinct interpretations of the user's intent.`,
			schema: interpretCardSchema
		});

		return json({ ...result.object, id: crypto.randomUUID() });

	} catch (error) {
		console.error('AI Generation Error:', error);
		if (error instanceof Error) {
			console.error('Error Stack:', error.stack);
		}
		return json({ error: 'Failed to generate response' }, { status: 500 });
	}
};
