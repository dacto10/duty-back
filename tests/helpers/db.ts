import { Database } from '../../src/repository/db';

export class TestDb {
	db: Database;

	constructor() {
		this.db = new Database();
	}

	async migrate() {
		await this.db.migrate();
	}

	async truncate() {
		await this.db.pool.query('TRUNCATE TABLE duties RESTART IDENTITY CASCADE;');
	}

	async close() {
		await this.db.close();
	}
}
