import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isServer = typeof window === "undefined";
const isProduction = isServer
	? process.env.NODE_ENV === "production"
	: (import.meta as any).env?.MODE === "production";

if (!isProduction && isServer) {
	const { existsSync } = await import("node:fs");
	const { resolve } = await import("node:path");
	const dotenv = await import("dotenv");

	const envPaths = [
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

const getRuntimeEnv = (): Record<string, string | undefined> => {
	if (!isServer && (import.meta as any).env) {
		return (import.meta as any).env;
	}
	if (isServer && typeof process !== "undefined") {
		return process.env as Record<string, string | undefined>;
	}
	return {};
};

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_API_URL: z.url(),
		VITE_APIMANAGER_URL: z.url(),
		VITE_DEBUG: z.coerce.boolean().default(false),
	},
	runtimeEnv: getRuntimeEnv(),
	emptyStringAsUndefined: true,
});

export function logDebug(message: string, data?: unknown): void {
	if (env.VITE_DEBUG) {
		console.log(`[DEBUG] ${message}`, data !== undefined ? data : "");
	}
}

export function logInfo(message: string, data?: unknown): void {
	console.log(`[INFO] ${message}`, data !== undefined ? data : "");
}

export function logError(message: string, error?: unknown): void {
	console.error(`[ERROR] ${message}`, error !== undefined ? error : "");
}
