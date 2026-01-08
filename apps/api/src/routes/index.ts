import type { Hono } from "hono";

import { authRouter } from "./auth";
import { systemRouter } from "./system";

type RouteMeta = {
	path: string;
	method: string;
	description: string;
};

type Router = {
	routes: Hono<any>;
	meta: RouteMeta[];
};

const routers: { prefix: string; router: Router }[] = [
	{ prefix: "/auth", router: authRouter },
	{ prefix: "/system", router: systemRouter },
];

export function registerRoutes(app: Hono): void {
	for (const { prefix, router } of routers) {
		app.route(`/v1${prefix}`, router.routes);
	}
}

export function getAllRouteMeta(): RouteMeta[] {
	const allMeta: RouteMeta[] = [];
	for (const { router } of routers) {
		allMeta.push(...router.meta);
	}
	return allMeta;
}

export function printRoutes(): void {
	console.log(
		"\n╔════════════════════════════════════════════════════════════════╗",
	);
	console.log(
		"║                     TALOS API ROUTES                           ║",
	);
	console.log(
		"╠════════════════════════════════════════════════════════════════╣",
	);

	const routes = getAllRouteMeta();
	const maxMethodLength = Math.max(...routes.map((r) => r.method.length));
	const maxPathLength = Math.max(...routes.map((r) => r.path.length));

	for (const route of routes) {
		const method = route.method.padEnd(maxMethodLength);
		const path = route.path.padEnd(maxPathLength);
		console.log(`║  ${method}  ${path}  │  ${route.description}`);
	}

	console.log(
		"╚════════════════════════════════════════════════════════════════╝\n",
	);
}
