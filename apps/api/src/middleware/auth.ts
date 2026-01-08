import { auth } from "@Talos/auth";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

export type AuthSession = {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		role: "admin" | "user";
		createdAt: Date;
		updatedAt: Date;
	};
	session: {
		id: string;
		expiresAt: Date;
		token: string;
		createdAt: Date;
		updatedAt: Date;
		ipAddress: string | null;
		userAgent: string | null;
		userId: string;
	};
};

export type AuthVariables = {
	session: AuthSession | null;
};

export const getSession = async (c: Context): Promise<AuthSession | null> => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	return session as AuthSession | null;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
	async (c: Context, next: Next) => {
		const session = await getSession(c);

		if (!session) {
			return c.json(
				{ error: "Unauthorized", message: "Authentication required" },
				401,
			);
		}

		c.set("session", session);
		await next();
	},
);

export const optionalAuthMiddleware = createMiddleware<{
	Variables: AuthVariables;
}>(async (c: Context, next: Next) => {
	const session = await getSession(c);
	c.set("session", session);
	await next();
});

export const adminMiddleware = createMiddleware<{ Variables: AuthVariables }>(
	async (c: Context, next: Next) => {
		const session = await getSession(c);

		if (!session) {
			return c.json(
				{ error: "Unauthorized", message: "Authentication required" },
				401,
			);
		}

		if (session.user.role !== "admin") {
			return c.json(
				{ error: "Forbidden", message: "Admin access required" },
				403,
			);
		}

		c.set("session", session);
		await next();
	},
);
