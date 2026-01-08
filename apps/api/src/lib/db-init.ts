import { db } from "@Talos/db";
import { user } from "@Talos/db/schema/auth";
import { spawn } from "node:child_process";
import { sql } from "drizzle-orm";

export async function initializeDatabase(): Promise<void> {
	console.log("[DB] Checking database connection...");

	try {
		await db.execute(sql`SELECT 1`);
		console.log("[DB] Database connection successful");
	} catch (error) {
		console.error("[DB] Failed to connect to database:", error);
		throw new Error("Database connection failed");
	}

	console.log("[DB] Running schema push...");
	await runDrizzlePush();
	console.log("[DB] Schema push complete");
}

async function runDrizzlePush(): Promise<void> {
	return new Promise((resolve, reject) => {
		const dbPackagePath = new URL("../../../../packages/db", import.meta.url)
			.pathname;
		const normalizedPath =
			process.platform === "win32" ? dbPackagePath.slice(1) : dbPackagePath;

		const child = spawn("pnpm", ["db:push"], {
			cwd: normalizedPath,
			stdio: "inherit",
			shell: true,
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`drizzle-kit push failed with code ${code}`));
			}
		});

		child.on("error", (error) => {
			reject(error);
		});
	});
}

export async function getUserCount(): Promise<number> {
	const result = await db.select({ count: sql<number>`count(*)` }).from(user);
	return Number(result[0]?.count ?? 0);
}

export async function isSystemInitialized(): Promise<boolean> {
	const count = await getUserCount();
	return count > 0;
}
