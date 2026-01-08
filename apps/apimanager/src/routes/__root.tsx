import {
	createRootRoute,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { apiClient } from "@/lib/api-client";

import appCss from "../index.css?url";

export const Route = createRootRoute({
	beforeLoad: async ({ location }) => {
		const isAuthRoute =
			location.pathname === "/init-auth" || location.pathname === "/sign-in";

		if (location.pathname === "/") {
			const status = await apiClient.getSystemStatus();

			if (!status.initialized) {
				throw redirect({ to: "/init-auth" });
			}

			const session = await apiClient.getSession();
			if (!session.authenticated) {
				throw redirect({ to: "/sign-in" });
			}

			throw redirect({ to: "/dashboard" });
		}

		if (!isAuthRoute) {
			return;
		}
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Talos API Manager",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('talos-theme');
									if (theme === 'light') {
										document.documentElement.classList.remove('dark');
									} else {
										document.documentElement.classList.add('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
			</head>
			<body className="font-sans antialiased">
				<ThemeProvider>
					<Outlet />
					<Toaster richColors position="top-right" />
				</ThemeProvider>
				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
