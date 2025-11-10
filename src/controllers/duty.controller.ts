import { DefaultController } from "./default.controller";
import { DutyService } from "../services";
import { type CreateDutyDTO, type UpdateDutyDTO, ZDutyParams, ZListQuery } from "../schemas";

export class DutyController extends DefaultController {
	constructor(private readonly service: DutyService) { super(); }

	list() {
		return this.apply(async ({ query }) => {
			const { page, pageSize } = ZListQuery.parse(query);

			return this.service.list(page, pageSize);
		});
	}

	get() {
		return this.apply(async ({ params }) => {
			const { id } = ZDutyParams.parse(params);
			const item = await this.service.get(id);

			if (!item) {
				const e: any = new Error("Not found");
				e.status = 404;
				throw e;
			}

			return item;
		});
	}

	create() {
		return this.apply(async ({ body }, res) => {
			const input = body as CreateDutyDTO;
			const created = await this.service.create(input.name);

			res.status(201);

			return created;
		});
	}

	update() {
		return this.apply(async ({ params, body }) => {
			const { id } = ZDutyParams.parse(params);
			const input = body as UpdateDutyDTO;
			return this.service.update(id, input.name);
		});
	}

	delete() {
		return this.apply(async ({ params }, res) => {
			const { id } = ZDutyParams.parse(params);
			await this.service.delete(id);
			res.status(204);
			return undefined;
		});
	}
}

