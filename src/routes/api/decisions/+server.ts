import { json } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { anyCardSchema } from '$lib/ai/schemas';
import { buildProductSpecArtifactData, isInspectArtifactCard } from '$lib/domain/product-spec';
import { artifacts, decisions, projects } from '$lib/server/db/schema';
import { serializeArtifact, serializeDecision } from '$lib/server/workspace';
import type { RequestHandler } from './$types';
import type { DecisionNode } from '$lib/domain/decisions-store';

const decisionRequestSchema = z.object({
	projectId: z.string(),
	cardId: z.string(),
	parentId: z.string().nullable(),
	summary: z.string().nullable(),
	cardSnapshot: anyCardSchema
});

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.json().catch(() => undefined);
	const parsed = decisionRequestSchema.safeParse(rawBody);

	if (!parsed.success) {
		return json({ error: 'Invalid decision payload' }, { status: 400 });
	}

	const body = parsed.data;
	const { getDb } = await import('$lib/server/db');
	const db = getDb();
	const id = crypto.randomUUID();
	const acceptedAt = new Date();
	let result;

	try {
		result = await db.transaction((tx) => {
			const [project] = tx.select().from(projects).where(eq(projects.id, body.projectId)).all();

			if (!project) {
				throw new Error('Project not found');
			}

			tx.insert(decisions)
				.values({
					id,
					projectId: body.projectId,
					cardId: body.cardId,
					parentId: body.parentId,
					artifactId: null,
					acceptedAt,
					summary: body.summary,
					cardSnapshot: JSON.stringify(body.cardSnapshot)
				})
				.run();

			let artifactId: string | null = null;
			let artifact = null;

			if (isInspectArtifactCard(body.cardSnapshot)) {
				artifactId = crypto.randomUUID();
				const decisionRows = tx
					.select()
					.from(decisions)
					.where(eq(decisions.projectId, body.projectId))
					.orderBy(asc(decisions.acceptedAt))
					.all();
				const serializedDecisions = decisionRows.map(serializeDecision);
				const activePath = pathForHead(serializedDecisions, id);
				const data = buildProductSpecArtifactData({
					projectTitle: project.title,
					seedPrompt: project.seedPrompt,
					decisions: activePath,
					inspectCard: body.cardSnapshot,
					sourceDecisionId: id,
					now: acceptedAt.toISOString()
				});

				tx.insert(artifacts)
					.values({
						id: artifactId,
						projectId: body.projectId,
						sourceDecisionId: id,
						sourceCardId: body.cardId,
						type: 'product-spec',
						title: data.brief.title,
						data: JSON.stringify(data),
						createdAt: acceptedAt,
						updatedAt: acceptedAt,
						createdBy: 'assistant'
					})
					.run();
				tx.update(decisions).set({ artifactId }).where(eq(decisions.id, id)).run();
				const [artifactRow] = tx.select().from(artifacts).where(eq(artifacts.id, artifactId)).all();
				artifact = serializeArtifact(artifactRow);
			}

			tx.update(projects)
				.set({
					activeHeadId: id,
					pinnedArtifactId: artifactId ?? project.pinnedArtifactId,
					updatedAt: acceptedAt
				})
				.where(eq(projects.id, body.projectId))
				.run();

			const [decisionRow] = tx.select().from(decisions).where(eq(decisions.id, id)).all();

			return {
				decision: serializeDecision(decisionRow),
				artifact
			};
		});
	} catch (error) {
		if (error instanceof Error && error.message === 'Project not found') {
			return json({ error: 'Project not found' }, { status: 404 });
		}
		throw error;
	}

	return json(result);
};

function pathForHead(nodes: DecisionNode[], headId: string) {
	const path: DecisionNode[] = [];
	let currentId: string | null = headId;

	while (currentId) {
		const current = nodes.find((node) => node.id === currentId);
		if (!current) break;
		path.unshift(current);
		currentId = current.parentId;
	}

	return path;
}
