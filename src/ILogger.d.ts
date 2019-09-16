export interface ILogger {
	warn(description: string, ...meta: any[]): void;
	info(description: string, ...meta: any[]): void;
	error(description: string, ...meta: any[]): void;
}