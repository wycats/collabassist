import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export const projects = sqliteTable('projects', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	seedPrompt: text('seed_prompt'),
	activeHeadId: text('active_head_id'),
	pinnedArtifactId: text('pinned_artifact_id'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type Project = typeof projects.$inferSelect;

export const artifacts = sqliteTable('artifacts', {
	id: text('id').primaryKey(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id),
	sourceDecisionId: text('source_decision_id').notNull(),
	sourceCardId: text('source_card_id').notNull(),
	type: text('type').notNull(),
	title: text('title').notNull(),
	data: text('data').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	createdBy: text('created_by').notNull()
});

export type Artifact = typeof artifacts.$inferSelect;

export const decisions = sqliteTable('decisions', {
	id: text('id').primaryKey(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id),
	cardId: text('card_id').notNull(),
	parentId: text('parent_id'), // Nullable for the root decision
	artifactId: text('artifact_id'),
	acceptedAt: integer('accepted_at', { mode: 'timestamp' }).notNull(),
	summary: text('summary'),
	cardSnapshot: text('card_snapshot').notNull() // JSON string of the accepted card
});

export type Decision = typeof decisions.$inferSelect;
