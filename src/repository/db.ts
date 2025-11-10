import { Pool } from "pg";
import { env } from "../utils";

export class Database {
	public readonly pool: Pool;

	constructor() {
		const connectionString =
			env.databaseUrl ||
			"postgres://postgres:postgres@localhost:5432/app";

		this.pool = new Pool({
			connectionString,
			ssl: (env.ssl ?? (process.env.PGSSL === "true")) ? { rejectUnauthorized: false } : undefined,
			max: 10,
		});
	}

	async migrate(): Promise<void> {
		await this.pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

		await this.pool.query(`
			CREATE TABLE IF NOT EXISTS duties (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				name text NOT NULL
			);
		`);
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}