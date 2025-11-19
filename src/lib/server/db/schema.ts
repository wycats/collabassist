import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export const decisions = sqliteTable('decisions', {
	id: text('id').primaryKey(),
	cardId: text('card_id').notNull(),
	parentId: text('parent_id'), // Nullable for the root decision
	acceptedAt: integer('accepted_at', { mode: 'timestamp' }).notNull(),
	summary: text('summary'),
	cardSnapshot: text('card_snapshot').notNull() // JSON string of the accepted card
});

export type Decision = typeof decisions.$inferSelect;
