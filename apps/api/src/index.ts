import { auth } from "@Talos/auth";
import { env, logDebug, logError, logInfo } from "@Talos/env/server";
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
	logDebug("404 Not Found", { path: c.req.path, method: c.req.method });
	return c.json(
		{ error: "Not Found", message: "The requested endpoint does not exist" },
		404,
	);
});

app.onError((error, c) => {
	logError("API Error", { path: c.req.path, error: error.message });
	return c.json(
		{ error: "Internal Server Error", message: "An unexpected error occurred" },
		500,
	);
});

const PORT = 3101;

async function startServer(): Promise<void> {
	logInfo("Starting Talos API Server...");
	logDebug("Environment", {
		NODE_ENV: env.NODE_ENV,
		DEBUG: env.DEBUG,
		BETTER_AUTH_URL: env.BETTER_AUTH_URL,
		CORS_ORIGIN: env.CORS_ORIGIN,
	});

	try {
		await initializeDatabase();
	} catch (error) {
		logError("Database initialization failed", error);
		process.exit(1);
	}

	printRoutes();
	logInfo(`Server running at http://localhost:${PORT}`);
}

startServer();

export default {
	port: PORT,
	fetch: app.fetch,
};
