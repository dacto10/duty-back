import express, { RequestHandler, type Express } from "express";
import cors from "cors";
import { DutyRouter } from "./routes";
import { DutyController } from "./controllers";
import { DutyService } from "./services";
import { ValidationMiddleware, LoggingMiddleware } from "./middlewares";
import { Database, PgDutyRepository } from "./repository";
import { type Route } from "./utils";

export class App {
	constructor() { }

	init(): Express {
		const db = new Database();
		void db.migrate();

		const validationMiddleware = new ValidationMiddleware();
		const loggingMiddleware = new LoggingMiddleware();

		const repo = new PgDutyRepository(db.pool);
		const service = new DutyService(repo);
		const controller = new DutyController(service);

		const dutyRouter = new DutyRouter(
			express.Router(),
			controller,
			validationMiddleware
		);

		const routes: Route[] = [
			{ endpoint: "/duties", routes: dutyRouter.routes },
			{ endpoint: "/health", routes: express.Router().get("/", (_, res) => res.send({ ok: true })) }
		];

		const middlewares = [
			cors(),
			express.json(),
			loggingMiddleware.log()
		];

		return this.configureApp(routes, middlewares);
	}

	private configureApp(routes: Route[], middlewares: RequestHandler[]): Express {
		const app = express();

		middlewares.forEach(mw => app.use(mw));

		routes.forEach(({ endpoint, routes: router }) => app.use(endpoint, router));

		return app;
	}
}

const bootstrap = new App().init();

export default bootstrap;