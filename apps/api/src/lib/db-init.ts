import { db } from "@Talos/db";
import { user } from "@Talos/db/schema/auth";
import { env } from "@Talos/env/server";
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

	if (env.NODE_ENV === "development") {
		console.log("[DB] Development mode - schema sync handled by drizzle-kit");
	} else {
		console.log("[DB] Production mode - using existing schema");
	}
}

export async function getUserCount(): Promise<number> {
	const result = await db.select({ count: sql<number>`count(*)` }).from(user);
	return Number(result[0]?.count ?? 0);
}

export async function isSystemInitialized(): Promise<boolean> {
	const count = await getUserCount();
	return count > 0;
}
