import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout")({
	beforeLoad: async () => {
		const status = await apiClient.getSystemStatus();
		if (!status.initialized) {
			throw redirect({ to: "/init-auth" });
		}

		const session = await apiClient.getSession();
		if (!session.authenticated) {
			throw redirect({ to: "/sign-in" });
		}

		return { session };
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return <Outlet />;
}
