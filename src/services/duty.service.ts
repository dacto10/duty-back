import type { IDutyRepository } from "../utils";
import { LoggingService } from "./logging.service";

export class DutyService {
	private readonly logger = new LoggingService(DutyService.name);
	constructor(private readonly repo: IDutyRepository) { }

	list(page: number, pageSize: number) {
		return this.repo.list(page, pageSize);
	}

	get(id: string) {
		return this.repo.get(id);
	}

	create(name: string) {
		this.logger.info("create", name);
		return this.repo.create({ name });
	}

	update(id: string, name: string) {
		this.logger.info("update", id, name);
		return this.repo.update(id, { name });
	}

	delete(id: string) {
		this.logger.info("delete", id);
		return this.repo.delete(id);
	}
}
