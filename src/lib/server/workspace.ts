import { asc, desc, eq } from 'drizzle-orm';
import type { ProductSpecArtifact, ProductSpecArtifactData } from '$lib/domain/artifact';
import type { DecisionNode } from '$lib/domain/decisions-store';
import type { Project } from '$lib/domain/project';
import {
	artifacts,
	decisions,
	projects,
	type Artifact,
	type Decision
} from '$lib/server/db/schema';
import { DEFAULT_PROJECT_TITLE } from '$lib/server/db';
import type { getDb } from '$lib/server/db';

type Db = ReturnType<typeof getDb>;

export function serializeProject(project: typeof projects.$inferSelect): Project {
	return {
		id: project.id,
		title: project.title,
		seedPrompt: project.seedPrompt,
		activeHeadId: project.activeHeadId,
		pinnedArtifactId: project.pinnedArtifactId,
		createdAt: project.createdAt.toISOString(),
		updatedAt: project.updatedAt.toISOString()
	};
}

export function serializeDecision(decision: Decision): DecisionNode {
	return {
		id: decision.id,
		projectId: decision.projectId,
		cardId: decision.cardId,
		parentId: decision.parentId,
		artifactId: decision.artifactId,
		acceptedAt: decision.acceptedAt.toISOString(),
		summary: decision.summary,
		cardSnapshot: JSON.parse(decision.cardSnapshot)
	};
}

export function serializeArtifact(artifact: Artifact): ProductSpecArtifact {
	return {
		id: artifact.id,
		projectId: artifact.projectId,
		sourceDecisionId: artifact.sourceDecisionId,
		sourceCardId: artifact.sourceCardId,
		type: artifact.type,
		title: artifact.title,
		data: JSON.parse(artifact.data) as ProductSpecArtifactData,
		createdAt: artifact.createdAt.toISOString(),
		updatedAt: artifact.updatedAt.toISOString(),
		createdBy: artifact.createdBy === 'user' ? 'user' : 'assistant'
	};
}

export async function loadWorkspace(db: Db, requestedProjectId: string | null) {
	const projectRows = db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
	const activeProject =
		projectRows.find((project) => project.id === requestedProjectId) ?? projectRows[0];

	const decisionRows = db
		.select()
		.from(decisions)
		.where(eq(decisions.projectId, activeProject.id))
		.orderBy(asc(decisions.acceptedAt))
		.all();
	const artifactRows = db
		.select()
		.from(artifacts)
		.where(eq(artifacts.projectId, activeProject.id))
		.orderBy(asc(artifacts.updatedAt))
		.all();

	const serializedDecisions = decisionRows.map(serializeDecision);
	const serializedArtifacts = artifactRows.map(serializeArtifact);
	const pinnedArtifact = artifactForHead(
		serializedDecisions,
		serializedArtifacts,
		activeProject.activeHeadId
	);

	return {
		projects: projectRows.map(serializeProject),
		activeProject: serializeProject(activeProject),
		decisions: serializedDecisions,
		artifacts: serializedArtifacts,
		pinnedArtifact
	};
}

export async function createProject(
	db: Db,
	input?: { title?: string | null; seedPrompt?: string | null }
) {
	const now = new Date();
	const id = crypto.randomUUID();
	const title =
		input?.title?.trim() || titleFromPrompt(input?.seedPrompt ?? null) || DEFAULT_PROJECT_TITLE;

	await db
		.insert(projects)
		.values({
			id,
			title,
			seedPrompt: input?.seedPrompt?.trim() || null,
			activeHeadId: null,
			pinnedArtifactId: null,
			createdAt: now,
			updatedAt: now
		})
		.run();

	return serializeProject({
		id,
		title,
		seedPrompt: input?.seedPrompt?.trim() || null,
		activeHeadId: null,
		pinnedArtifactId: null,
		createdAt: now,
		updatedAt: now
	});
}

export function titleFromPrompt(prompt: string | null) {
	if (!prompt) return null;
	const words = prompt
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.split(/\s+/)
		.slice(0, 6);

	if (words.length === 0) return null;
	return words.join(' ');
}

export function artifactForHead(
	decisionNodes: DecisionNode[],
	artifactNodes: ProductSpecArtifact[],
	headId: string | null
) {
	const activePath = pathForHead(decisionNodes, headId);
	const artifactByDecisionId = new Map(
		artifactNodes.map((artifact) => [artifact.sourceDecisionId, artifact])
	);

	for (const decision of activePath.slice().reverse()) {
		const artifact = artifactByDecisionId.get(decision.id);
		if (artifact) return artifact;
	}

	return null;
}

function pathForHead(nodes: DecisionNode[], headId: string | null) {
	if (nodes.length === 0) return [];
	const selectedId = headId && nodes.some((node) => node.id === headId) ? headId : nodes.at(-1)?.id;
	const path: DecisionNode[] = [];
	let currentId = selectedId ?? null;

	while (currentId) {
		const current = nodes.find((node) => node.id === currentId);
		if (!current) break;
		path.unshift(current);
		currentId = current.parentId;
	}

	return path;
}
