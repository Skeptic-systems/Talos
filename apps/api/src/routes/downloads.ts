import { db } from "@Talos/db";
import {
	download,
	downloadCommand,
	downloadProviderEnum,
	installTypeEnum,
} from "@Talos/db/schema/download";
import { user } from "@Talos/db/schema/auth";
import { and, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import {
	type AuthVariables,
	adminMiddleware,
	authMiddleware,
} from "../middleware/auth";

const downloadsRoutes = new Hono<{ Variables: AuthVariables }>();

const createDownloadSchema = z.object({
	displayName: z.string().min(1, "Display name is required").max(200),
	packageId: z.string().max(200).optional().nullable(),
	description: z.string().max(5000).optional().nullable(),
	provider: z.enum(["winget", "chocolatey", "custom"]),
	installType: z.enum(["single", "multi"]).default("single"),
	cardArtwork: z.string().max(500000).optional().nullable(),
	icon: z.string().max(500000).optional().nullable(),
	previewImage: z.string().max(500000).optional().nullable(),
	scriptPath: z.string().max(500).optional().nullable(),
	scriptContent: z.string().max(100000).optional().nullable(),
	isInteractive: z.boolean().default(false),
	commands: z.array(z.string().min(1)).min(1, "At least one command is required"),
});

const updateDownloadSchema = createDownloadSchema.partial();

downloadsRoutes.get("/", authMiddleware, async (c) => {
	const downloads = await db
		.select({
			id: download.id,
			displayName: download.displayName,
			packageId: download.packageId,
			description: download.description,
			provider: download.provider,
			installType: download.installType,
			cardArtwork: download.cardArtwork,
			icon: download.icon,
			previewImage: download.previewImage,
			scriptPath: download.scriptPath,
			isInteractive: download.isInteractive,
			createdById: download.createdById,
			createdAt: download.createdAt,
			updatedAt: download.updatedAt,
		})
		.from(download)
		.orderBy(desc(download.createdAt));

	const downloadIds = downloads.map((d) => d.id);

	const commands =
		downloadIds.length > 0
			? await db
					.select({
						id: downloadCommand.id,
						downloadId: downloadCommand.downloadId,
						command: downloadCommand.command,
						sortOrder: downloadCommand.sortOrder,
					})
					.from(downloadCommand)
					.orderBy(downloadCommand.sortOrder)
			: [];

	const commandsByDownload = commands.reduce(
		(acc, cmd) => {
			if (!acc[cmd.downloadId]) {
				acc[cmd.downloadId] = [];
			}
			acc[cmd.downloadId].push(cmd);
			return acc;
		},
		{} as Record<string, typeof commands>,
	);

	const result = downloads.map((d) => ({
		...d,
		commands: commandsByDownload[d.id] ?? [],
	}));

	return c.json({ downloads: result });
});

downloadsRoutes.get("/stats", authMiddleware, async (c) => {
	const [totalCount] = await db.select({ count: count() }).from(download);

	const [singleCount] = await db
		.select({ count: count() })
		.from(download)
		.where(eq(download.installType, "single"));

	const [multiCount] = await db
		.select({ count: count() })
		.from(download)
		.where(eq(download.installType, "multi"));

	const [userCount] = await db.select({ count: count() }).from(user);

	return c.json({
		stats: {
			totalDownloads: totalCount.count,
			singleInstall: singleCount.count,
			multiInstall: multiCount.count,
			activeUsers: userCount.count,
		},
	});
});

downloadsRoutes.get("/recent", authMiddleware, async (c) => {
	const recentDownloads = await db
		.select({
			id: download.id,
			displayName: download.displayName,
			provider: download.provider,
			installType: download.installType,
			icon: download.icon,
			createdAt: download.createdAt,
		})
		.from(download)
		.orderBy(desc(download.createdAt))
		.limit(5);

	return c.json({ downloads: recentDownloads });
});

downloadsRoutes.get("/:id", authMiddleware, async (c) => {
	const downloadId = c.req.param("id");

	const [downloadData] = await db
		.select()
		.from(download)
		.where(eq(download.id, downloadId));

	if (!downloadData) {
		return c.json({ error: "Download not found" }, 404);
	}

	const commands = await db
		.select()
		.from(downloadCommand)
		.where(eq(downloadCommand.downloadId, downloadId))
		.orderBy(downloadCommand.sortOrder);

	return c.json({
		download: {
			...downloadData,
			commands,
		},
	});
});

downloadsRoutes.post("/", adminMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const validation = createDownloadSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { commands, ...downloadData } = validation.data;

	const [createdDownload] = await db
		.insert(download)
		.values({
			...downloadData,
			createdById: session.user.id,
		})
		.returning();

	if (commands.length > 0) {
		await db.insert(downloadCommand).values(
			commands.map((cmd, index) => ({
				downloadId: createdDownload.id,
				command: cmd,
				sortOrder: index,
			})),
		);
	}

	const insertedCommands = await db
		.select()
		.from(downloadCommand)
		.where(eq(downloadCommand.downloadId, createdDownload.id))
		.orderBy(downloadCommand.sortOrder);

	return c.json(
		{
			download: {
				...createdDownload,
				commands: insertedCommands,
			},
		},
		201,
	);
});

downloadsRoutes.put("/:id", adminMiddleware, async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const downloadId = c.req.param("id");

	const [existingDownload] = await db
		.select({ id: download.id })
		.from(download)
		.where(eq(download.id, downloadId));

	if (!existingDownload) {
		return c.json({ error: "Download not found" }, 404);
	}

	const body = await c.req.json();
	const validation = updateDownloadSchema.safeParse(body);

	if (!validation.success) {
		return c.json(
			{
				error: "Validation failed",
				details: validation.error.flatten().fieldErrors,
			},
			400,
		);
	}

	const { commands, ...updateData } = validation.data;

	if (Object.keys(updateData).length > 0) {
		await db
			.update(download)
			.set(updateData)
			.where(eq(download.id, downloadId));
	}

	if (commands !== undefined) {
		await db
			.delete(downloadCommand)
			.where(eq(downloadCommand.downloadId, downloadId));

		if (commands.length > 0) {
			await db.insert(downloadCommand).values(
				commands.map((cmd, index) => ({
					downloadId,
					command: cmd,
					sortOrder: index,
				})),
			);
		}
	}

	const [updatedDownload] = await db
		.select()
		.from(download)
		.where(eq(download.id, downloadId));

	const updatedCommands = await db
		.select()
		.from(downloadCommand)
		.where(eq(downloadCommand.downloadId, downloadId))
		.orderBy(downloadCommand.sortOrder);

	return c.json({
		download: {
			...updatedDownload,
			commands: updatedCommands,
		},
	});
});

downloadsRoutes.delete("/:id", adminMiddleware, async (c) => {
	const downloadId = c.req.param("id");

	const [existingDownload] = await db
		.select({ id: download.id })
		.from(download)
		.where(eq(download.id, downloadId));

	if (!existingDownload) {
		return c.json({ error: "Download not found" }, 404);
	}

	await db
		.delete(downloadCommand)
		.where(eq(downloadCommand.downloadId, downloadId));
	await db.delete(download).where(eq(download.id, downloadId));

	return c.json({ success: true, message: "Download deleted successfully" });
});

export const downloadsRouter = {
	routes: downloadsRoutes,
	meta: [
		{
			path: "/v1/downloads",
			method: "GET",
			description: "List all downloads (requires auth)",
		},
		{
			path: "/v1/downloads/stats",
			method: "GET",
			description: "Get download statistics (requires auth)",
		},
		{
			path: "/v1/downloads/recent",
			method: "GET",
			description: "Get recent downloads (requires auth)",
		},
		{
			path: "/v1/downloads/:id",
			method: "GET",
			description: "Get single download (requires auth)",
		},
		{
			path: "/v1/downloads",
			method: "POST",
			description: "Create download (requires admin)",
		},
		{
			path: "/v1/downloads/:id",
			method: "PUT",
			description: "Update download (requires admin)",
		},
		{
			path: "/v1/downloads/:id",
			method: "DELETE",
			description: "Delete download (requires admin)",
		},
	],
};
