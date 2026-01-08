import { Hono } from "hono";

import { isSystemInitialized } from "../lib/db-init";

const systemRoutes = new Hono();

systemRoutes.get("/status", async (c) => {
	const initialized = await isSystemInitialized();
	return c.json({
		initialized,
		timestamp: new Date().toISOString(),
	});
});

systemRoutes.get("/health", (c) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

export const systemRouter = {
	routes: systemRoutes,
	meta: [
		{
			path: "/v1/system/status",
			method: "GET",
			description: "Check if system is initialized (has users)",
		},
		{
			path: "/v1/system/health",
			method: "GET",
			description: "Health check endpoint",
		},
	],
};
