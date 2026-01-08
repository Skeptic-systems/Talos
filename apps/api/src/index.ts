import { auth } from "@Talos/auth";
import { env } from "@Talos/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { initializeDatabase } from "./lib/db-init";
import { printRoutes, registerRoutes } from "./routes";

const app = new Hono();

app.use(logger());
app.use(secureHeaders());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

registerRoutes(app);

app.get("/", (c) => {
	return c.json({
		name: "Talos API",
		version: "1.0.0",
		status: "ok",
	});
});

app.notFound((c) => {
	return c.json(
		{ error: "Not Found", message: "The requested endpoint does not exist" },
		404,
	);
});

app.onError((error, c) => {
	console.error("[API Error]", error);
	return c.json(
		{ error: "Internal Server Error", message: "An unexpected error occurred" },
		500,
	);
});

async function startServer(): Promise<void> {
	console.log("\n🚀 Starting Talos API Server...\n");

	try {
		await initializeDatabase();
	} catch (error) {
		console.error("[Startup] Database initialization failed:", error);
		process.exit(1);
	}

	printRoutes();

	const port = 3000;
	console.log(`\n✅ Server running at http://localhost:${port}\n`);
}

startServer();

export default app;
