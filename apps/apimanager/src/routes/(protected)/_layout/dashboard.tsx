import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Activity, LogOut, Settings, Shield, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });

	const handleSignOut = async () => {
		try {
			await apiClient.signOut();
			toast.success("Signed out successfully");
			window.location.href = "/sign-in";
		} catch {
			toast.error("Failed to sign out");
		}
	};

	return (
		<div className="min-h-svh bg-zinc-950">
			<header className="border-zinc-800 border-b bg-zinc-900/50 backdrop-blur-sm">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
					<div className="flex items-center gap-3">
						<Shield className="h-8 w-8 text-blue-500" />
						<span className="font-bold text-xl text-zinc-100">Talos</span>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
								<User className="h-4 w-4 text-blue-500" />
							</div>
							<div className="hidden sm:block">
								<p className="font-medium text-sm text-zinc-100">
									{session.user?.name}
								</p>
								<p className="text-xs text-zinc-400">{session.user?.role}</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleSignOut}
							className="text-zinc-400 hover:text-zinc-100"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8">
				<div className="mb-8">
					<h1 className="font-bold text-3xl text-zinc-100">Dashboard</h1>
					<p className="mt-1 text-zinc-400">
						Welcome back, {session.user?.name}
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
								<Activity className="h-6 w-6 text-green-500" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">System Status</p>
								<p className="font-bold text-2xl text-zinc-100">Online</p>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
								<User className="h-6 w-6 text-blue-500" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Your Role</p>
								<p className="font-bold text-2xl text-zinc-100 capitalize">
									{session.user?.role}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
								<Settings className="h-6 w-6 text-purple-500" />
							</div>
							<div>
								<p className="text-sm text-zinc-400">Configuration</p>
								<p className="font-bold text-2xl text-zinc-100">Ready</p>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
					<h2 className="mb-4 font-semibold text-lg text-zinc-100">
						Account Information
					</h2>
					<div className="space-y-3">
						<div className="flex justify-between border-zinc-800 border-b pb-3">
							<span className="text-zinc-400">Name</span>
							<span className="text-zinc-100">{session.user?.name}</span>
						</div>
						<div className="flex justify-between border-zinc-800 border-b pb-3">
							<span className="text-zinc-400">Email</span>
							<span className="text-zinc-100">{session.user?.email}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-zinc-400">Role</span>
							<span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-blue-400 text-xs capitalize">
								{session.user?.role}
							</span>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
