import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const envPaths = [
	resolve(process.cwd(), ".env"),
	resolve(process.cwd(), "../../.env"),
];

for (const envPath of envPaths) {
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath });
		break;
	}
}

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});
