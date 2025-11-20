import { z } from 'zod';

export const interpretOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	summary: z.string().optional()
});

export const interpretCardSchema = z.object({
	kind: z.literal('interpret'),
	title: z.string(),
	description: z.string(),
	options: z.array(interpretOptionSchema)
});

export const proposeOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	summary: z.string().optional()
});

export const proposeCardSchema = z.object({
	kind: z.literal('propose'),
	title: z.string(),
	description: z.string(),
	options: z.array(proposeOptionSchema)
});

export const regionSchema = z.object({
	id: z.string(),
	label: z.string(),
	layout: z.enum(['shelf', 'bookcase', 'library']),
	role: z.enum(['sidebar', 'switcher', 'content']).optional(),
	notes: z.string().optional()
});

export const mockupCardSchema = z.object({
	kind: z.literal('mockup'),
	title: z.string(),
	description: z.string(),
	regions: z.array(regionSchema)
});

export const lensSectionSchema = z.object({
	id: z.string(),
	label: z.string(),
	contents: z.array(z.string())
});

export const lensCardSchema = z.object({
	kind: z.literal('lens'),
	title: z.string(),
	description: z.string(),
	lensType: z.string(),
	payload: z.object({
		sections: z.array(lensSectionSchema),
		callsToAction: z.array(z.string())
	})
});

export const anyCardSchema = z.discriminatedUnion('kind', [
	interpretCardSchema,
	proposeCardSchema,
	mockupCardSchema,
	lensCardSchema
]);
