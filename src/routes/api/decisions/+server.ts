import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { decisions } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import type { AnyCard } from '$lib/cards/types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as {
		cardId: string;
		parentId: string | null;
		summary: string | null;
		cardSnapshot: AnyCard;
	};

	const id = crypto.randomUUID();
	const acceptedAt = new Date();

	await db.insert(decisions).values({
		id,
		cardId: body.cardId,
		parentId: body.parentId,
		acceptedAt,
		summary: body.summary,
		cardSnapshot: JSON.stringify(body.cardSnapshot)
	});

	return json({
		id,
		cardId: body.cardId,
		parentId: body.parentId,
		acceptedAt,
		summary: body.summary,
		cardSnapshot: body.cardSnapshot
	});
};
