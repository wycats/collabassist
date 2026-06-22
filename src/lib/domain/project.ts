export interface Project {
	id: string;
	title: string;
	seedPrompt: string | null;
	activeHeadId: string | null;
	pinnedArtifactId: string | null;
	createdAt: string;
	updatedAt: string;
}
