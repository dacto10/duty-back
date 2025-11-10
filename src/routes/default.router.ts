import { Router } from "express";
import { IRouter } from "../utils";

export abstract class DefaultRouter implements IRouter {
	constructor(protected readonly router: Router) { }

	abstract get routes(): Router;
};
