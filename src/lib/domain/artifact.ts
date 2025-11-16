// src/lib/domain/artifact.ts
export type ArtifactType = 'doc' | 'canvas' | 'schema' | 'layout' | 'code' | string;

export interface Artifact {
	id: string;
	type: ArtifactType;
	data: unknown;
	createdAt: string;
	updatedAt: string;
	createdBy: 'user' | 'assistant';
}
