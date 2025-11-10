import { DutyService } from '../../src/services/duty.service';
import type { IDutyRepository } from '../../src/utils/types';

const mkRepo = (): jest.Mocked<IDutyRepository> => ({
	list: jest.fn(),
	get: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn()
});

describe('DutyService', () => {
	it('forwards pagination and CRUD to repository', async () => {
		const repo = mkRepo();
		const svc = new DutyService(repo);

		await svc.list(2, 3);
		expect(repo.list).toHaveBeenCalledWith(2, 3);

		await svc.create('A');
		expect(repo.create).toHaveBeenCalledWith({ name: 'A' });

		await svc.update('id1', 'B');
		expect(repo.update).toHaveBeenCalledWith('id1', { name: 'B' });

		await svc.delete('id2');
		expect(repo.delete).toHaveBeenCalledWith('id2');
	});
});
