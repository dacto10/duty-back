import { Router } from "express";
import { DefaultRouter } from "./default.router";
import { DutyController } from "../controllers";
import { ValidationMiddleware } from "../middlewares";
import { ZCreateDutyDTO, ZUpdateDutyDTO } from "../schemas";

export class DutyRouter extends DefaultRouter {
	constructor(
		router: Router,
		private readonly controller: DutyController,
		private readonly validation: ValidationMiddleware
	) { super(router); }

	get routes() {
		this.router.get("/", this.controller.list());
		this.router.get("/:id", this.controller.get());

		this.router.post(
			"/",
			this.validation.validate(ZCreateDutyDTO),
			this.controller.create()
		);

		this.router.put(
			"/:id",
			this.validation.validate(ZUpdateDutyDTO),
			this.controller.update()
		);

		this.router.delete("/:id", this.controller.delete());

		return this.router;
	}
}
