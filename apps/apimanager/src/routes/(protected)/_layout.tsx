import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { GridBackground } from "@/components/ui/grid-background";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout")({
	beforeLoad: async () => {
		const status = await apiClient.getSystemStatus();
		if (!status.initialized) {
			throw redirect({ to: "/init-auth" });
		}

		const session = await apiClient.getSession();
		if (!session.authenticated || !session.user) {
			throw redirect({ to: "/sign-in" });
		}

		return { session };
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });

	if (!session.user) {
		return null;
	}

	return (
		<GridBackground>
			<AppNavbar user={session.user} />
			<main className="mx-auto max-w-7xl px-4 py-8">
				<Outlet />
			</main>
		</GridBackground>
	);
}
