import { auth } from "@Talos/auth";
import { db } from "@Talos/db";
import { user } from "@Talos/db/schema/auth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { isSystemInitialized } from "../lib/db-init";
import {
	type AuthVariables,
	authMiddleware,
	getSession,
} from "../middleware/auth";

const authRoutes = new Hono<{ Variables: AuthVariables }>();

const initSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(128)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		),
});

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
	key: string,
	maxAttempts: number,
	windowMs: number,
): boolean {
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	if (!entry || now > entry.resetAt) {
		rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (entry.count >= maxAttempts) {
		return false;
	}

	entry.count++;
	return true;
}

authRoutes.post("/init", async (c) => {
	const ip =
		c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

	if (!checkRateLimit(`init:${ip}`, 3, 60 * 60 * 1000)) {
		return c.json(
			{ error: "Too many requests", message: "Please try again later" },
			429,
		);
	}

	const initialized = await isSystemInitialized();
	if (initialized) {
		return c.json(
			{ error: "Forbidden", message: "System is already initialized" },
			403,
		);
	}

	const body = await c.req.json();
	const validation = initSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { name, email, password } = validation.data;

	try {
		const result = await auth.api.signUpEmail({
			body: { name, email, password },
			headers: c.req.raw.headers,
		});

		if (!result.user) {
			return c.json({ error: "Failed to create user" }, 500);
		}

		await db
			.update(user)
			.set({ role: "admin" })
			.where(eq(user.id, result.user.id));

		return c.json({
			success: true,
			message: "Admin account created successfully",
			user: {
				id: result.user.id,
				name: result.user.name,
				email: result.user.email,
				role: "admin",
			},
		});
	} catch (error) {
		console.error("[Auth] Init error:", error);
		return c.json({ error: "Failed to create admin account" }, 500);
	}
});

authRoutes.post("/sign-in", async (c) => {
	const ip =
		c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

	if (!checkRateLimit(`signin:${ip}`, 5, 15 * 60 * 1000)) {
		return c.json(
			{ error: "Too many attempts", message: "Please try again in 15 minutes" },
			429,
		);
	}

	const body = await c.req.json();
	const validation = signInSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	try {
		const response = await auth.api.signInEmail({
			body: validation.data,
			headers: c.req.raw.headers,
			asResponse: true,
		});

		return response;
	} catch (error) {
		console.error("[Auth] Sign-in error:", error);
		return c.json({ error: "Invalid credentials" }, 401);
	}
});

authRoutes.post("/sign-out", authMiddleware, async (c) => {
	try {
		const response = await auth.api.signOut({
			headers: c.req.raw.headers,
			asResponse: true,
		});
		return response;
	} catch (error) {
		console.error("[Auth] Sign-out error:", error);
		return c.json({ error: "Failed to sign out" }, 500);
	}
});

authRoutes.get("/session", async (c) => {
	const session = await getSession(c);

	if (!session) {
		return c.json({ authenticated: false, user: null });
	}

	return c.json({
		authenticated: true,
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			role: session.user.role,
			image: session.user.image,
		},
	});
});

export const authRouter = {
	routes: authRoutes,
	meta: [
		{
			path: "/v1/auth/init",
			method: "POST",
			description: "Create first admin user (only if no users exist)",
		},
		{
			path: "/v1/auth/sign-in",
			method: "POST",
			description: "Sign in with email and password",
		},
		{
			path: "/v1/auth/sign-out",
			method: "POST",
			description: "Sign out and clear session (requires auth)",
		},
		{
			path: "/v1/auth/session",
			method: "GET",
			description: "Get current session information",
		},
	],
};
