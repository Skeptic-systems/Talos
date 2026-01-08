import { Gear, Heartbeat, ShieldCheck, User } from "@phosphor-icons/react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/_layout/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });

	return (
		<>
			<div className="mb-8">
				<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">Dashboard</h1>
				<p className="mt-1 text-zinc-600 dark:text-zinc-400">Welcome back, {session.user?.name}</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
							<Heartbeat className="h-6 w-6 text-green-500" weight="bold" />
						</div>
						<div>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">System Status</p>
							<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">Online</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
							<User className="h-6 w-6 text-blue-500" weight="bold" />
						</div>
						<div>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">Your Role</p>
							<p className="font-bold text-2xl text-zinc-900 capitalize dark:text-zinc-100">
								{session.user?.role}
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
							<Gear className="h-6 w-6 text-purple-500" weight="bold" />
						</div>
						<div>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">Configuration</p>
							<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">Ready</p>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-8 rounded-xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
				<h2 className="mb-4 font-semibold text-lg text-zinc-900 dark:text-zinc-100">
					Account Information
				</h2>
				<div className="space-y-3">
					<div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
						<span className="text-zinc-600 dark:text-zinc-400">Name</span>
						<span className="text-zinc-900 dark:text-zinc-100">{session.user?.name}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
						<span className="text-zinc-600 dark:text-zinc-400">Email</span>
						<span className="text-zinc-900 dark:text-zinc-100">{session.user?.email}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-zinc-600 dark:text-zinc-400">Role</span>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-medium text-blue-600 text-xs capitalize dark:text-blue-400">
							{session.user?.role === "admin" && (
								<ShieldCheck className="h-3.5 w-3.5" weight="fill" />
							)}
							{session.user?.role}
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
