import Database from 'better-sqlite3';

const databaseUrl = process.env.DATABASE_URL ?? 'local.db';
const databasePath = databaseUrl.startsWith('sqlite://')
	? databaseUrl.slice('sqlite://'.length)
	: databaseUrl.startsWith('sqlite:')
		? databaseUrl.slice('sqlite:'.length)
		: databaseUrl;

const db = new Database(databasePath);

const sql = `
CREATE TABLE IF NOT EXISTS decisions (
    id text PRIMARY KEY NOT NULL,
    card_id text NOT NULL,
    parent_id text,
    accepted_at integer NOT NULL,
    summary text,
    card_snapshot text NOT NULL
);
`;

try {
	db.exec(sql);
	console.log('Successfully created decisions table.');
} catch (error) {
	console.error('Error creating table:', error);
}
