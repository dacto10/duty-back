import { NextFunction, Request, Response } from "express";

export class LoggingMiddleware {
	log() {
		return (req: Request, res: Response, next: NextFunction) => {
			const t0 = Date.now();
			
			res.on("finish", () => {
				const ms = Date.now() - t0;
				
				console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms}ms`);
			});

			next();
		};
	}
}
