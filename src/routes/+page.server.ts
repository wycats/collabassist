import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const { getDb } = await import('$lib/server/db');
	const { loadWorkspace } = await import('$lib/server/workspace');
	const db = getDb();

	return loadWorkspace(db, url.searchParams.get('projectId'));
};
