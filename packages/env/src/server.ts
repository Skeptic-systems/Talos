import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

const requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "CORS_ORIGIN"];
const hasEnvVars = requiredEnvVars.every((key) => process.env[key]);

if (!hasEnvVars) {
	const __dirname = fileURLToPath(new URL(".", import.meta.url));
	const envPaths = [
		resolve(__dirname, "../../../.env"),
		resolve(process.cwd(), ".env"),
		resolve(process.cwd(), "../../.env"),
	];

	for (const envPath of envPaths) {
		if (existsSync(envPath)) {
			dotenv.config({ path: envPath });
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
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
