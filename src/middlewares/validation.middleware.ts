import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export class ValidationMiddleware {
	validate<T extends ZodRawShape>(schema: ZodObject<T> | undefined) {
		return ({ body }: Request, res: Response, next: NextFunction) => {
			try {
				if (!schema) return next();
				schema.parse(body);
				
				next();
			} catch (e) {
				res.status(400).send({ message: "Bad request.", details: JSON.parse((e as Error).message) });
			}
		};
	}
}
