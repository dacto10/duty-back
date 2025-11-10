export class LoggingService {
	constructor(private readonly ctx: string) { }

	info(...msg: any[]) {
		console.log(`[${this.ctx}]`, ...msg);
	}
	error(...msg: any[]) {
		console.error(`[${this.ctx}]`, ...msg);
	}
}
