import Database from 'better-sqlite3';

const db = new Database('local.db');

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
