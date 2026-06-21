import { z } from 'zod';

const cardBaseSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	description: z.string().optional(),
	flowId: z.string().optional(),
	stepIndex: z.number().int().nonnegative().optional()
});

export const interpretOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	summary: z.string()
});

export const interpretCardSchema = cardBaseSchema.extend({
	kind: z.literal('interpret'),
	options: z.array(interpretOptionSchema).min(2).max(5)
});

export const proposeOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	summary: z.string()
});

export const proposeCardSchema = cardBaseSchema.extend({
	kind: z.literal('propose'),
	options: z.array(proposeOptionSchema).min(2).max(5)
});

export const regionSchema = z.object({
	id: z.string(),
	label: z.string(),
	layout: z.enum(['shelf', 'bookcase', 'library']),
	role: z.enum(['sidebar', 'switcher', 'content']).optional(),
	notes: z.string().optional()
});

export const mockupCardSchema = cardBaseSchema.extend({
	kind: z.literal('mockup'),
	regions: z.array(regionSchema).min(1)
});

export const lensSectionSchema = z.object({
	id: z.string(),
	label: z.string(),
	contents: z.array(z.string())
});

export const lensPayloadSchema = z.object({
	sections: z.array(lensSectionSchema),
	callsToAction: z.array(z.string())
});

export const lensCardSchema = cardBaseSchema.extend({
	kind: z.literal('lens'),
	lensType: z.enum(['entities', 'flows', 'screens', 'permissions']),
	payload: lensPayloadSchema
});

export const errorCardSchema = cardBaseSchema.extend({
	kind: z.literal('error'),
	errorKind: z.enum(['missing_info', 'model_uncertain', 'invalid_state']),
	details: z.string().optional(),
	recoveryHint: z.string().optional()
});

export const selectionSummaryCardSchema = cardBaseSchema.extend({
	kind: z.literal('selection-summary'),
	selectionId: z.string(),
	selectionLabel: z.string(),
	selectionSummary: z.string().optional(),
	sourceCardKind: z.enum(['interpret', 'propose'])
});

export const anyCardSchema = z.discriminatedUnion('kind', [
	interpretCardSchema,
	proposeCardSchema,
	mockupCardSchema,
	lensCardSchema,
	errorCardSchema,
	selectionSummaryCardSchema
]);

export const inspectCardSchema = z.discriminatedUnion('kind', [mockupCardSchema, lensCardSchema]);

export type CardGenerationSchema =
	| typeof interpretCardSchema
	| typeof proposeCardSchema
	| typeof inspectCardSchema
	| typeof mockupCardSchema
	| typeof lensCardSchema
	| typeof errorCardSchema
	| typeof anyCardSchema;
