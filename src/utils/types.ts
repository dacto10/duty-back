import { Router } from "express";
import { Duty } from "../schemas";

export interface IRouter { routes: Router; }

export type Route = { endpoint: string; routes: Router; }

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export interface IRepository<T> {
	list(page: number, pageSize: number): Promise<Paginated<T>>;
	get(id: string): Promise<T | null>;
	create(input: { name: string }): Promise<T>;
	update(id: string, input: { name: string }): Promise<T>;
	delete(id: string): Promise<void>;
}

export interface IDutyRepository extends IRepository<Duty> { }

export abstract class Exception extends Error {
	constructor(message: string, public status: number) {
		super(message);
	}
}

export class BadRequestException extends Exception {
	constructor(message?: string) {
		super(message || "Bad Request", 400);
	}
}

export class AlreadyExistsException extends Exception {
	constructor(message?: string) {
		super(message || "Already Exists", 409);
	}
}

export class NotFoundException extends Exception {
	constructor(message?: string) {
		super(message || "Not Found", 404);
	}
}
