import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const getViteEnv = (): Record<string, string | undefined> => {
	if (typeof window !== "undefined" && (import.meta as any).env) {
		return (import.meta as any).env;
	}
	if (typeof process !== "undefined" && process.env) {
		return process.env as Record<string, string | undefined>;
	}
	return {};
};

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_SERVER_URL: z.url(),
	},
	runtimeEnv: getViteEnv(),
	emptyStringAsUndefined: true,
});
