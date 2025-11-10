import { Pool } from "pg";
import type { Duty } from "../schemas";
import { IDutyRepository, NotFoundException, Paginated } from "../utils";

export class PgDutyRepository implements IDutyRepository {
	constructor(private readonly pool: Pool) { }

	async list(page: number, pageSize: number): Promise<Paginated<Duty>> {
		const safePage = Math.max(1, page | 0);
		const safePageSize = Math.min(Math.max(1, pageSize | 0), 100);
		const offset = (safePage - 1) * safePageSize;

		const [{ rows: items }, { rows: [{ count }] }] = await Promise.all([
			this.pool.query(
				`SELECT id::text, name
         FROM duties
         ORDER BY name ASC
         LIMIT $1 OFFSET $2`,
				[safePageSize, offset]
			),
			this.pool.query(`SELECT COUNT(*)::int AS count FROM duties`),
		]);

		const total = Number(count);
		const totalPages = Math.max(1, Math.ceil(total / safePageSize));

		return { items, total, page: safePage, pageSize: safePageSize, totalPages };
	}

	async get(id: string): Promise<Duty | null> {
		const { rows } = await this.pool.query(
			"SELECT id::text, name FROM duties WHERE id = $1",
			[id]
		);
		
		if (!rows[0]) {
			throw new NotFoundException(`Duty (${id}) not found`);
		}

		return rows[0];
	}

	async create(input: { name: string }): Promise<Duty> {
		const { rows } = await this.pool.query(
			"INSERT INTO duties (name) VALUES ($1) RETURNING id::text, name",
			[input.name]
		);
		return rows[0];
	}

	async update(id: string, input: { name: string }): Promise<Duty> {
		const { rows } = await this.pool.query(
			"UPDATE duties SET name = $1 WHERE id = $2 RETURNING id::text, name",
			[input.name, id]
		);

		if (!rows[0]) {
			throw new NotFoundException(`Duty (${id}) not found`);
		}

		return rows[0];
	}

	async delete(id: string): Promise<void> {
		await this.pool.query("DELETE FROM duties WHERE id = $1", [id]);
	}
}