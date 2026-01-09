import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
	const { existsSync } = await import("node:fs");
	const { resolve } = await import("node:path");
	const { fileURLToPath } = await import("node:url");
	const dotenv = await import("dotenv");

	const __dirname = fileURLToPath(new URL(".", import.meta.url));
	const envPaths = [
		resolve(__dirname, "../../../.env"),
		resolve(process.cwd(), ".env"),
		resolve(process.cwd(), "../../.env"),
	];

	for (const envPath of envPaths) {
		if (existsSync(envPath)) {
			dotenv.config({ path: envPath });
			console.log(`[ENV] Loaded environment from: ${envPath}`);
			break;
		}
	}
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		DEBUG: z.coerce.boolean().default(false),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});

export function logDebug(message: string, data?: unknown): void {
	if (env.DEBUG) {
		console.log(`[DEBUG] ${message}`, data !== undefined ? data : "");
	}
}

export function logInfo(message: string, data?: unknown): void {
	console.log(`[INFO] ${message}`, data !== undefined ? data : "");
}

export function logError(message: string, error?: unknown): void {
	console.error(`[ERROR] ${message}`, error !== undefined ? error : "");
}
