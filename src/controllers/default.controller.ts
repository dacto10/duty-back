import { Request, Response } from "express";
import { LoggingService } from "../services";
import { Exception } from "../utils";

export class DefaultController {
	private readonly logger = new LoggingService(DefaultController.name);

	protected apply<T>(fn: (req: Request, res: Response) => Promise<T>) {
		return async (req: Request, res: Response) => {
			try {
				const data = await fn(req, res);

				if (!res.headersSent) res.status(res.statusCode || 200).send(data);
			} catch (err) {
				if (err instanceof Exception) {
					this.logger.error(err.message);

					res.status(err.status).send({ error: err.message });
				} else {
					this.logger.error(err instanceof Error ? err.message : "Unknown error");

					res.status(500).send({ error: "Internal server error" });
				}
			}
		};
	}
}
