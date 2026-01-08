import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const downloadProviderEnum = pgEnum("download_provider", [
	"winget",
	"chocolatey",
	"custom",
]);

export const installTypeEnum = pgEnum("install_type", ["single", "multi"]);

export const download = pgTable(
	"download",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		displayName: text("display_name").notNull(),
		packageId: text("package_id"),
		description: text("description"),
		provider: downloadProviderEnum("provider").notNull(),
		installType: installTypeEnum("install_type").notNull().default("single"),
		cardArtwork: text("card_artwork"),
		icon: text("icon"),
		previewImage: text("preview_image"),
		scriptPath: text("script_path"),
		scriptContent: text("script_content"),
		isInteractive: boolean("is_interactive").default(false).notNull(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("download_provider_idx").on(table.provider),
		index("download_created_by_idx").on(table.createdById),
	],
);

export const downloadCommand = pgTable(
	"download_command",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		downloadId: uuid("download_id")
			.notNull()
			.references(() => download.id, { onDelete: "cascade" }),
		command: text("command").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("download_command_download_idx").on(table.downloadId)],
);

export const downloadRelations = relations(download, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [download.createdById],
		references: [user.id],
	}),
	commands: many(downloadCommand),
}));

export const downloadCommandRelations = relations(downloadCommand, ({ one }) => ({
	download: one(download, {
		fields: [downloadCommand.downloadId],
		references: [download.id],
	}),
}));
