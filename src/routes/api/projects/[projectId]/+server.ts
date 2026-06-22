import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { projects } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

const updateProjectSchema = z.object({
	title: z.string().trim().min(1).optional(),
	seedPrompt: z.string().trim().min(1).nullable().optional(),
	activeHeadId: z.string().nullable().optional(),
	pinnedArtifactId: z.string().nullable().optional()
});

export const PATCH: RequestHandler = async ({ params, request }) => {
	const rawBody = await request.json().catch(() => undefined);
	const parsed = updateProjectSchema.safeParse(rawBody);

	if (!parsed.success) {
		return json({ error: 'Invalid project update payload' }, { status: 400 });
	}

	const updates = parsed.data;
	if (Object.keys(updates).length === 0) {
		return json({ error: 'No project update fields supplied' }, { status: 400 });
	}

	const { getDb } = await import('$lib/server/db');
	const { serializeProject, titleFromPrompt } = await import('$lib/server/workspace');
	const db = getDb();
	const [existing] = db.select().from(projects).where(eq(projects.id, params.projectId)).all();

	if (!existing) {
		return json({ error: 'Project not found' }, { status: 404 });
	}

	const nextSeedPrompt =
		updates.seedPrompt === undefined ? existing.seedPrompt : updates.seedPrompt?.trim() || null;
	const nextTitle =
		updates.title?.trim() ||
		(existing.title === 'Untitled product spec' ? titleFromPrompt(nextSeedPrompt) : null) ||
		existing.title;

	await db
		.update(projects)
		.set({
			title: nextTitle,
			seedPrompt: nextSeedPrompt,
			activeHeadId:
				updates.activeHeadId === undefined ? existing.activeHeadId : updates.activeHeadId,
			pinnedArtifactId:
				updates.pinnedArtifactId === undefined
					? existing.pinnedArtifactId
					: updates.pinnedArtifactId,
			updatedAt: new Date()
		})
		.where(eq(projects.id, params.projectId))
		.run();

	const [updated] = db.select().from(projects).where(eq(projects.id, params.projectId)).all();
	return json(serializeProject(updated));
};
