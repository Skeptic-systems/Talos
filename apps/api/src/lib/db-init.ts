import { db } from "@Talos/db";
import { user } from "@Talos/db/schema/auth";
import { env, logDebug, logError, logInfo } from "@Talos/env/server";
import { sql } from "drizzle-orm";

export async function initializeDatabase(): Promise<void> {
	logInfo("Checking database connection...");
	logDebug("Database URL pattern", {
		hasUrl: !!env.DATABASE_URL,
		urlStart: env.DATABASE_URL?.substring(0, 20) + "...",
	});

	try {
		await db.execute(sql`SELECT 1`);
		logInfo("Database connection successful");
	} catch (error) {
		logError("Failed to connect to database", error);
		throw new Error("Database connection failed");
	}

	if (env.NODE_ENV === "development") {
		logInfo("Development mode - schema sync handled by drizzle-kit");
	} else {
		logInfo("Production mode - using existing schema");
	}
}

export async function getUserCount(): Promise<number> {
	const result = await db.select({ count: sql<number>`count(*)` }).from(user);
	const count = Number(result[0]?.count ?? 0);
	logDebug("User count", { count });
	return count;
}

export async function isSystemInitialized(): Promise<boolean> {
	const count = await getUserCount();
	return count > 0;
}
