import request from 'supertest';
import { App } from '../../src/app';
import { TestDb } from '../helpers/db';

describe('Duties – Integration (real DB)', () => {
	const testDb = new TestDb();
	let app: ReturnType<App['init']>;

	beforeAll(async () => {
		await testDb.migrate();
		app = new App().init();
	});

	beforeEach(async () => {
		await testDb.truncate();
	});

	afterAll(async () => {
		await testDb.close();
	});

	it('health endpoint works', async () => {
		const res = await request(app).get('/health').expect(200);
		expect(res.body).toEqual({ ok: true });
	});

	it('CRUD: create → get → update → list (paginated) → delete → 404 on get', async () => {
		const created = await request(app)
			.post('/duties')
			.send({ name: 'Test duty' })
			.expect(201);
		expect(created.body).toEqual(expect.objectContaining({ id: expect.any(String), name: 'Test duty' }));

		const got = await request(app).get(`/duties/${created.body.id}`).expect(200);
		expect(got.body.name).toBe('Test duty');

		const updated = await request(app)
			.put(`/duties/${created.body.id}`)
			.send({ name: 'Updated test duty' })
			.expect(200);
		expect(updated.body.name).toBe('Updated test duty');

		for (let i = 1; i <= 9; i++) {
			await request(app).post('/duties').send({ name: `Task ${i}` }).expect(201);
		}

		const p1 = await request(app).get('/duties?page=1&pageSize=3').expect(200);

		expect(p1.body).toMatchObject({ page: 1, pageSize: 3, total: 10, totalPages: 4 });
		expect(Array.isArray(p1.body.items)).toBe(true);
		expect(p1.body.items.length).toBe(3);

		const p4 = await request(app).get('/duties?page=4&pageSize=3').expect(200);
		expect(p4.body.items.length).toBe(1);

		await request(app).delete(`/duties/${created.body.id}`).expect(204);
		await request(app).get(`/duties/${created.body.id}`).expect(404);
	});

	it('pagination', async () => {
		for (let i = 1; i <= 10; i++) {
			await request(app).post('/duties').send({ name: `Job ${String(i).padStart(2, '0')}` }).expect(201);
		}

		const good = await request(app).get('/duties?page=2&pageSize=4').expect(200);
		expect(good.body.page).toBe(2);
		expect(good.body.pageSize).toBe(4);
		expect(good.body.total).toBe(10);
		expect(good.body.totalPages).toBe(3);
		expect(good.body.items.length).toBe(4);
	});

	it('validation failures – body', async () => {
		await request(app).post('/duties').send({}).expect(400);
		await request(app).post('/duties').send({ name: '' }).expect(400);
	});

	it('SQL injection guard', async () => {
		const created = await request(app)
			.post('/duties')
			.send({ name: "Robert'); DROP TABLE duties; --" })
			.expect(201);

		expect(created.body.name).toContain('Robert');
		const list = await request(app).get('/duties').expect(200);
		expect(list.body.total).toBeGreaterThan(0);
	});
});
