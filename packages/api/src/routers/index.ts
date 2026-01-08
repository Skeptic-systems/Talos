// DEPRECATED: tRPC has been removed from the API.
// This file exists only for backwards compatibility with desktop and www apps.
// These apps will be migrated to use REST API in a future update.

import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const appRouter = t.router({});
export type AppRouter = typeof appRouter;
