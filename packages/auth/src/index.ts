import { db } from "@Talos/db";
import * as schema from "@Talos/db/schema/auth";
import { env } from "@Talos/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
				required: false,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "strict",
			secure: env.NODE_ENV === "production",
			httpOnly: true,
		},
	},
	plugins: [],
});
