import {
	ArrowsClockwise,
	MagnifyingGlass,
	Package,
	PencilSimple,
	Plus,
	Trash,
} from "@phosphor-icons/react";
import {
	Link,
	createFileRoute,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type DownloadListItem, apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout/downloads")({
	component: DownloadsPage,
});

function DownloadsPage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });
	const navigate = useNavigate();
	const isAdmin = session.user?.role === "admin";

	const [downloads, setDownloads] = useState<DownloadListItem[]>([]);
	const [filteredDownloads, setFilteredDownloads] = useState<DownloadListItem[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [downloadToDelete, setDownloadToDelete] =
		useState<DownloadListItem | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadDownloads = useCallback(async () => {
		try {
			const { downloads: fetchedDownloads } = await apiClient.listDownloads();
			setDownloads(fetchedDownloads);
			setFilteredDownloads(fetchedDownloads);
		} catch {
			toast.error("Failed to load downloads");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadDownloads();
	}, [loadDownloads]);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredDownloads(downloads);
		} else {
			const query = searchQuery.toLowerCase();
			setFilteredDownloads(
				downloads.filter(
					(d) =>
						d.displayName.toLowerCase().includes(query) ||
						d.description?.toLowerCase().includes(query) ||
						d.provider.toLowerCase().includes(query) ||
						d.commands.some((c) => c.command.toLowerCase().includes(query)),
				),
			);
		}
	}, [searchQuery, downloads]);

	const handleDeleteDownload = async () => {
		if (!downloadToDelete) return;

		setIsDeleting(true);
		try {
			await apiClient.deleteDownload(downloadToDelete.id);
			toast.success("Download deleted successfully");
			setIsDeleteDialogOpen(false);
			setDownloadToDelete(null);
			loadDownloads();
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to delete download");
		} finally {
			setIsDeleting(false);
		}
	};

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

	const getInstallTypeBadgeStyle = (installType: string): string => {
		return installType === "multi"
			? "bg-green-500/10 text-green-600 dark:text-green-400"
			: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
	};

	const getCommandPreview = (download: DownloadListItem): string => {
		if (download.commands.length === 0) return "";
		const firstCommand = download.commands[0].command;
		if (download.provider === "custom") {
			const lines = firstCommand.split("\n");
			const preview = lines[0].slice(0, 50);
			return lines.length > 1 || lines[0].length > 50 ? `${preview}...` : preview;
		}
		return firstCommand.length > 60 ? `${firstCommand.slice(0, 60)}...` : firstCommand;
	};

	const handleCardClick = (downloadId: string, e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest("button")) return;
		navigate({ to: "/download-detail/$downloadId", params: { downloadId } });
	};

	return (
		<>
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
						Downloads
					</h1>
					<p className="mt-1 text-zinc-600 dark:text-zinc-400">
						Manage download blueprints for the desktop app
					</p>
				</div>
				{isAdmin && (
					<Link to="/download-create">
						<Button className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
							<Plus className="mr-2 h-4 w-4" weight="bold" />
							Create Download
						</Button>
					</Link>
				)}
			</div>

			<div className="mb-6">
				<div className="relative">
					<MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
					<Input
						placeholder="Search downloads..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="rounded-xl border-zinc-300 bg-white/50 pl-10 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<ArrowsClockwise className="h-8 w-8 animate-spin text-zinc-400" />
				</div>
			) : filteredDownloads.length === 0 ? (
				<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<CardContent className="py-16">
						<div className="flex flex-col items-center justify-center text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
								<Package className="h-8 w-8 text-zinc-400" />
							</div>
							<p className="mt-4 font-medium text-zinc-600 dark:text-zinc-400">
								{searchQuery ? "No downloads found" : "No downloads yet"}
							</p>
							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
								{searchQuery
									? "Try adjusting your search query"
									: "Create your first download blueprint to get started"}
							</p>
							{isAdmin && !searchQuery && (
								<Link to="/download-create" className="mt-4">
									<Button size="sm" className="rounded-lg">
										<Plus className="mr-2 h-4 w-4" weight="bold" />
										Create Download
									</Button>
								</Link>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredDownloads.map((download) => (
						<Card
							key={download.id}
							onClick={(e) => handleCardClick(download.id, e)}
							className="group cursor-pointer overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
											<Package
												className={`h-5 w-5 ${getProviderColor(download.provider)}`}
												weight="bold"
											/>
										</div>
										<div>
											<CardTitle className="text-base text-zinc-900 dark:text-zinc-100">
												{download.displayName}
											</CardTitle>
											<p className="line-clamp-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
												{getCommandPreview(download)}
											</p>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="mb-3 flex flex-wrap gap-2">
									<span
										className={`inline-flex rounded-lg px-2 py-0.5 text-xs capitalize ${getProviderBadgeStyle(download.provider)}`}
									>
										{download.provider}
									</span>
									<span
										className={`inline-flex rounded-lg px-2 py-0.5 text-xs capitalize ${getInstallTypeBadgeStyle(download.installType)}`}
									>
										{download.installType === "multi" ? "Multi Install" : "Single"}
									</span>
								</div>

								{download.description && (
									<p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
										{download.description}
									</p>
								)}

								<div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
									<p className="text-xs text-zinc-500 dark:text-zinc-500">
										{download.commands.length} command
										{download.commands.length !== 1 ? "s" : ""}
									</p>
									{isAdmin && (
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={(e) => {
													e.stopPropagation();
													navigate({
														to: "/download-edit/$downloadId",
														params: { downloadId: download.id },
													});
												}}
												className="rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
											>
												<PencilSimple className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={(e) => {
													e.stopPropagation();
													setDownloadToDelete(download);
													setIsDeleteDialogOpen(true);
												}}
												className="rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
											>
												<Trash className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="overflow-hidden rounded-xl border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
							<Trash className="h-5 w-5 text-red-500 dark:text-red-400" />
							Delete Download
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium text-zinc-900 dark:text-zinc-100">
								{downloadToDelete?.displayName}
							</span>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setDownloadToDelete(null);
							}}
							className="rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteDownload}
							disabled={isDeleting}
							className="rounded-lg bg-red-600 text-white hover:bg-red-700"
						>
							{isDeleting ? "Deleting..." : "Delete Download"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
