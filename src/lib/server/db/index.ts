import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

export const DEFAULT_PROJECT_ID = 'local-product-spec';
export const DEFAULT_PROJECT_TITLE = 'Untitled product spec';

let db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb() {
	if (!db) {
		const client = new Database(resolveDatabasePath(env.DATABASE_URL));
		bootstrap(client);
		db = drizzle(client, { schema });
	}

	return db;
}

function resolveDatabasePath(databaseUrl: string | undefined) {
	const url = databaseUrl?.trim() || 'local.db';

	if (url === ':memory:') return url;
	if (url.startsWith('sqlite://')) return url.slice('sqlite://'.length);
	if (url.startsWith('sqlite:')) return url.slice('sqlite:'.length);

	return url;
}

function bootstrap(client: Database.Database) {
	const now = Date.now();

	client.exec(`
		CREATE TABLE IF NOT EXISTS projects (
			id text PRIMARY KEY NOT NULL,
			title text NOT NULL,
			seed_prompt text,
			active_head_id text,
			pinned_artifact_id text,
			created_at integer NOT NULL,
			updated_at integer NOT NULL
		);

		CREATE TABLE IF NOT EXISTS artifacts (
			id text PRIMARY KEY NOT NULL,
			project_id text NOT NULL REFERENCES projects(id),
			source_decision_id text NOT NULL,
			source_card_id text NOT NULL,
			type text NOT NULL,
			title text NOT NULL,
			data text NOT NULL,
			created_at integer NOT NULL,
			updated_at integer NOT NULL,
			created_by text NOT NULL
		);

		CREATE TABLE IF NOT EXISTS decisions (
			id text PRIMARY KEY NOT NULL,
			project_id text NOT NULL DEFAULT '${DEFAULT_PROJECT_ID}' REFERENCES projects(id),
			card_id text NOT NULL,
			parent_id text,
			artifact_id text,
			accepted_at integer NOT NULL,
			summary text,
			card_snapshot text NOT NULL
		);
	`);

	client
		.prepare(
			`
			INSERT OR IGNORE INTO projects (
				id,
				title,
				seed_prompt,
				active_head_id,
				pinned_artifact_id,
				created_at,
				updated_at
			)
			VALUES (?, ?, NULL, NULL, NULL, ?, ?)
		`
		)
		.run(DEFAULT_PROJECT_ID, DEFAULT_PROJECT_TITLE, now, now);

	ensureColumn(client, 'decisions', 'project_id', `text NOT NULL DEFAULT '${DEFAULT_PROJECT_ID}'`);
	ensureColumn(client, 'decisions', 'artifact_id', 'text');
	client
		.prepare("UPDATE decisions SET project_id = ? WHERE project_id IS NULL OR project_id = ''")
		.run(DEFAULT_PROJECT_ID);

	const latestDecision = client
		.prepare('SELECT id FROM decisions WHERE project_id = ? ORDER BY accepted_at DESC LIMIT 1')
		.get(DEFAULT_PROJECT_ID) as { id: string } | undefined;

	if (latestDecision) {
		client
			.prepare(
				`
				UPDATE projects
				SET active_head_id = COALESCE(active_head_id, ?), updated_at = ?
				WHERE id = ?
			`
			)
			.run(latestDecision.id, now, DEFAULT_PROJECT_ID);
	}
}

function ensureColumn(
	client: Database.Database,
	table: string,
	column: string,
	definition: string
) {
	const columns = client.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
	if (columns.some((existing) => existing.name === column)) return;
	client.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
