import { db } from '$lib/server/db';
import { decisions } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allDecisions = await db.select().from(decisions).orderBy(decisions.acceptedAt);
	
	// Parse the cardSnapshot JSON
	const parsedDecisions = allDecisions.map(d => ({
		...d,
		cardSnapshot: JSON.parse(d.cardSnapshot)
	}));

	return {
		decisions: parsedDecisions
	};
};
