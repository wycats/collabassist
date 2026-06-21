import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const projectRequestSchema = z.object({
	title: z.string().trim().min(1).optional(),
	seedPrompt: z.string().trim().min(1).optional()
});

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.json().catch(() => ({}));
	const parsed = projectRequestSchema.safeParse(rawBody ?? {});

	if (!parsed.success) {
		return json({ error: 'Invalid project payload' }, { status: 400 });
	}

	const { getDb } = await import('$lib/server/db');
	const { createProject } = await import('$lib/server/workspace');
	const project = await createProject(getDb(), parsed.data);

	return json(project);
};
