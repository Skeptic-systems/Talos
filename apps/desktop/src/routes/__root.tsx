import type { AppRouter } from "@Talos/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { Toaster } from "@/components/ui/sonner";

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<div className="grid h-screen grid-rows-[auto_1fr]">
			<Outlet />
			<Toaster richColors />
		</div>
	);
}
