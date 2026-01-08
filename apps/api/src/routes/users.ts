import { auth } from "@Talos/auth";
import { db } from "@Talos/db";
import { account, user } from "@Talos/db/schema/auth";
import { and, count, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import {
	type AuthVariables,
	adminMiddleware,
	authMiddleware,
} from "../middleware/auth";

const usersRoutes = new Hono<{ Variables: AuthVariables }>();

const updateProfileSchema = z.object({
	name: z.string().min(1, "Name is required").max(100).optional(),
	email: z.string().email("Invalid email address").optional(),
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(128)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		),
});

const updateAvatarSchema = z.object({
	image: z.string().max(500000, "Image too large").nullable(),
});

const createUserSchema = z.object({
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
	role: z.enum(["admin", "user"]).default("user"),
});

const updateRoleSchema = z.object({
	role: z.enum(["admin", "user"]),
});

usersRoutes.get("/me", authMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const [userData] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
			createdAt: user.createdAt,
		})
		.from(user)
		.where(eq(user.id, session.user.id));

	if (!userData) {
		return c.json({ error: "User not found" }, 404);
	}

	return c.json({ user: userData });
});

usersRoutes.put("/me", authMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const validation = updateProfileSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { name, email } = validation.data;

	if (email) {
		const existingUser = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.email, email), ne(user.id, session.user.id)));

		if (existingUser.length > 0) {
			return c.json({ error: "Email already in use" }, 409);
		}
	}

	const updateData: Partial<{ name: string; email: string }> = {};
	if (name) updateData.name = name;
	if (email) updateData.email = email;

	if (Object.keys(updateData).length === 0) {
		return c.json({ error: "No fields to update" }, 400);
	}

	const [updatedUser] = await db
		.update(user)
		.set(updateData)
		.where(eq(user.id, session.user.id))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
		});

	return c.json({ user: updatedUser });
});

usersRoutes.put("/me/password", authMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const validation = changePasswordSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { currentPassword, newPassword } = validation.data;

	try {
		await auth.api.changePassword({
			body: {
				currentPassword,
				newPassword,
			},
			headers: c.req.raw.headers,
		});

		return c.json({ success: true, message: "Password changed successfully" });
	} catch (error) {
		console.error("[Users] Change password error:", error);
		return c.json({ error: "Current password is incorrect" }, 400);
	}
});

usersRoutes.post("/me/avatar", authMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const validation = updateAvatarSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { image } = validation.data;

	const [updatedUser] = await db
		.update(user)
		.set({ image })
		.where(eq(user.id, session.user.id))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
		});

	return c.json({ user: updatedUser });
});

usersRoutes.get("/", adminMiddleware, async (c) => {
	const users = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
			createdAt: user.createdAt,
		})
		.from(user)
		.orderBy(user.createdAt);

	return c.json({ users });
});

usersRoutes.post("/", adminMiddleware, async (c) => {
	const body = await c.req.json();
	const validation = createUserSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { name, email, password, role } = validation.data;

	const existingUser = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email));

	if (existingUser.length > 0) {
		return c.json({ error: "Email already in use" }, 409);
	}

	try {
		const result = await auth.api.signUpEmail({
			body: { name, email, password },
			headers: c.req.raw.headers,
		});

		if (!result.user) {
			return c.json({ error: "Failed to create user" }, 500);
		}

		if (role === "admin") {
			await db
				.update(user)
				.set({ role: "admin" })
				.where(eq(user.id, result.user.id));
		}

		const [createdUser] = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, result.user.id));

		return c.json({ user: createdUser }, 201);
	} catch (error) {
		console.error("[Users] Create user error:", error);
		return c.json({ error: "Failed to create user" }, 500);
	}
});

usersRoutes.delete("/:id", adminMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const userId = c.req.param("id");

	if (userId === session.user.id) {
		return c.json({ error: "You cannot delete yourself" }, 400);
	}

	const [targetUser] = await db
		.select({ id: user.id, role: user.role })
		.from(user)
		.where(eq(user.id, userId));

	if (!targetUser) {
		return c.json({ error: "User not found" }, 404);
	}

	if (targetUser.role === "admin") {
		const [adminCount] = await db
			.select({ count: count() })
			.from(user)
			.where(eq(user.role, "admin"));

		if (adminCount.count <= 1) {
			return c.json({ error: "Cannot delete the last admin" }, 400);
		}
	}

	await db.delete(account).where(eq(account.userId, userId));
	await db.delete(user).where(eq(user.id, userId));

	return c.json({ success: true, message: "User deleted successfully" });
});

usersRoutes.put("/:id/role", adminMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const userId = c.req.param("id");

	const body = await c.req.json();
	const validation = updateRoleSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { role: newRole } = validation.data;

	const [targetUser] = await db
		.select({ id: user.id, role: user.role })
		.from(user)
		.where(eq(user.id, userId));

	if (!targetUser) {
		return c.json({ error: "User not found" }, 404);
	}

	if (targetUser.role === "admin" && newRole === "user") {
		const [adminCount] = await db
			.select({ count: count() })
			.from(user)
			.where(eq(user.role, "admin"));

		if (adminCount.count <= 1) {
			return c.json({ error: "Cannot demote the last admin" }, 400);
		}
	}

	const [updatedUser] = await db
		.update(user)
		.set({ role: newRole })
		.where(eq(user.id, userId))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
		});

	return c.json({ user: updatedUser });
});

export const usersRouter = {
	routes: usersRoutes,
	meta: [
		{
			path: "/v1/users/me",
			method: "GET",
			description: "Get current user profile (requires auth)",
		},
		{
			path: "/v1/users/me",
			method: "PUT",
			description: "Update current user profile (requires auth)",
		},
		{
			path: "/v1/users/me/password",
			method: "PUT",
			description: "Change password (requires auth)",
		},
		{
			path: "/v1/users/me/avatar",
			method: "POST",
			description: "Update avatar (requires auth)",
		},
		{
			path: "/v1/users",
			method: "GET",
			description: "List all users (requires admin)",
		},
		{
			path: "/v1/users",
			method: "POST",
			description: "Create new user (requires admin)",
		},
		{
			path: "/v1/users/:id",
			method: "DELETE",
			description: "Delete user (requires admin)",
		},
		{
			path: "/v1/users/:id/role",
			method: "PUT",
			description: "Update user role (requires admin)",
		},
	],
};
