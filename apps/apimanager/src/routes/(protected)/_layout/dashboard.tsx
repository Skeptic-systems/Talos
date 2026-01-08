import {
	ArrowRight,
	ArrowsClockwise,
	ChartBar,
	Download,
	Gear,
	Package,
	Plus,
	Users,
} from "@phosphor-icons/react";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	apiClient,
	type DownloadStats,
	type RecentDownload,
} from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });
	const isAdmin = session.user?.role === "admin";

	const [stats, setStats] = useState<DownloadStats | null>(null);
	const [recentDownloads, setRecentDownloads] = useState<RecentDownload[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadDashboardData = useCallback(async () => {
		try {
			const [statsResponse, recentResponse] = await Promise.all([
				apiClient.getDownloadStats(),
				apiClient.getRecentDownloads(),
			]);
			setStats(statsResponse.stats);
			setRecentDownloads(recentResponse.downloads);
		} catch {
			toast.error("Failed to load dashboard data");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadDashboardData();
	}, [loadDashboardData]);

	const getProviderColor = (provider: string): string => {
		switch (provider) {
			case "winget":
				return "text-blue-500 dark:text-blue-400";
			case "chocolatey":
				return "text-amber-500 dark:text-amber-400";
			case "custom":
				return "text-purple-500 dark:text-purple-400";
			default:
				return "text-zinc-500 dark:text-zinc-400";
		}
	};

	const getProviderBadgeStyle = (provider: string): string => {
		switch (provider) {
			case "winget":
				return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
			case "chocolatey":
				return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
			case "custom":
				return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
			default:
				return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
		}
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
					Dashboard
				</h1>
				<p className="mt-1 text-zinc-600 dark:text-zinc-400">
					Welcome to your Talos API Manager
				</p>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<ArrowsClockwise className="h-8 w-8 animate-spin text-zinc-400" />
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardContent className="pt-4">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
										<Download className="h-6 w-6 text-blue-500" weight="bold" />
									</div>
									<div>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Total Downloads
										</p>
										<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
											{stats?.totalDownloads ?? 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardContent className="pt-4">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
										<Package className="h-6 w-6 text-green-500" weight="bold" />
									</div>
									<div>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Single Install
										</p>
										<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
											{stats?.singleInstall ?? 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardContent className="pt-4">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
										<ChartBar
											className="h-6 w-6 text-purple-500"
											weight="bold"
										/>
									</div>
									<div>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Multi Install
										</p>
										<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
											{stats?.multiInstall ?? 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardContent className="pt-4">
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
										<Users className="h-6 w-6 text-amber-500" weight="bold" />
									</div>
									<div>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Active Users
										</p>
										<p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
											{stats?.activeUsers ?? 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="mt-8 grid gap-6 lg:grid-cols-2">
						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
									<Gear className="h-5 w-5" />
									Quick Actions
								</CardTitle>
								<CardDescription>Common tasks and shortcuts</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{isAdmin && (
									<Link
										to="/download-create"
										className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
												<Plus className="h-5 w-5 text-blue-500" weight="bold" />
											</div>
											<div>
												<p className="font-medium text-zinc-900 dark:text-zinc-100">
													Create Download
												</p>
												<p className="text-sm text-zinc-500 dark:text-zinc-400">
													Add a new download blueprint
												</p>
											</div>
										</div>
										<ArrowRight className="h-5 w-5 text-zinc-400" />
									</Link>
								)}

								<Link
									to="/downloads"
									className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
											<Download
												className="h-5 w-5 text-purple-500"
												weight="bold"
											/>
										</div>
										<div>
											<p className="font-medium text-zinc-900 dark:text-zinc-100">
												Manage Downloads
											</p>
											<p className="text-sm text-zinc-500 dark:text-zinc-400">
												View and edit existing downloads
											</p>
										</div>
									</div>
									<ArrowRight className="h-5 w-5 text-zinc-400" />
								</Link>
							</CardContent>
						</Card>

						<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
											<Download className="h-5 w-5" />
											Recent Downloads
										</CardTitle>
										<CardDescription>
											Latest download blueprints
										</CardDescription>
									</div>
									<Link to="/downloads">
										<Button variant="ghost" size="sm">
											View all
											<ArrowRight className="ml-1 h-4 w-4" />
										</Button>
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								{recentDownloads.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-8 text-center">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
											<Package className="h-8 w-8 text-zinc-400" />
										</div>
										<p className="mt-4 font-medium text-zinc-600 dark:text-zinc-400">
											No downloads yet
										</p>
										<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
											Create your first download blueprint to get started
										</p>
										{isAdmin && (
											<Link to="/download-create" className="mt-4">
												<Button size="sm">
													<Plus className="mr-2 h-4 w-4" weight="bold" />
													Create Download
												</Button>
											</Link>
										)}
									</div>
								) : (
									<div className="space-y-3">
										{recentDownloads.map((download) => (
											<Link
												key={download.id}
												to="/download-detail/$downloadId"
												params={{ downloadId: download.id }}
												className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
											>
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
														<Package
															className={`h-5 w-5 ${getProviderColor(download.provider)}`}
															weight="bold"
														/>
													</div>
													<div>
														<p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
															{download.displayName}
														</p>
														<div className="flex items-center gap-2">
															<span
																className={`inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${getProviderBadgeStyle(download.provider)}`}
															>
																{download.provider}
															</span>
															<span className="text-xs text-zinc-500 dark:text-zinc-500">
																{download.installType === "multi"
																	? "Multi"
																	: "Single"}
															</span>
														</div>
													</div>
												</div>
												<ArrowRight className="h-4 w-4 text-zinc-400" />
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</>
	);
}
