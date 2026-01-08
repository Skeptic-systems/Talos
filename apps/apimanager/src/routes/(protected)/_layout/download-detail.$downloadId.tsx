import {
	ArrowLeft,
	ArrowsClockwise,
	Code,
	Copy,
	Package,
	PencilSimple,
	Terminal,
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

import { getIconComponent } from "@/components/downloads/IconPicker";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import { type Download, apiClient } from "@/lib/api-client";

export const Route = createFileRoute(
	"/(protected)/_layout/download-detail/$downloadId",
)({
	component: DownloadDetailPage,
});

function DownloadDetailPage() {
	const { downloadId } = Route.useParams();
	const { session } = useRouteContext({ from: "/(protected)/_layout" });
	const navigate = useNavigate();
	const isAdmin = session.user?.role === "admin";

	const [download, setDownload] = useState<Download | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadDownload = useCallback(async () => {
		try {
			const { download: fetchedDownload } =
				await apiClient.getDownload(downloadId);
			setDownload(fetchedDownload);
		} catch {
			toast.error("Failed to load download");
			navigate({ to: "/downloads" });
		} finally {
			setIsLoading(false);
		}
	}, [downloadId, navigate]);

	useEffect(() => {
		loadDownload();
	}, [loadDownload]);

	const handleDeleteDownload = async () => {
		if (!download) return;

		setIsDeleting(true);
		try {
			await apiClient.deleteDownload(download.id);
			toast.success("Download deleted successfully");
			navigate({ to: "/downloads" });
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to delete download");
		} finally {
			setIsDeleting(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
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

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case "winget":
				return <Package className="h-4 w-4" weight="bold" />;
			case "chocolatey":
				return <Terminal className="h-4 w-4" weight="bold" />;
			case "custom":
				return <Code className="h-4 w-4" weight="bold" />;
			default:
				return <Package className="h-4 w-4" weight="bold" />;
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<ArrowsClockwise className="h-8 w-8 animate-spin text-zinc-400" />
			</div>
		);
	}

	if (!download) {
		return (
			<div className="py-16 text-center">
				<p className="text-zinc-600 dark:text-zinc-400">Download not found</p>
				<Link to="/downloads" className="mt-4 inline-block">
					<Button variant="outline" className="rounded-lg">
						Back to downloads
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<>
			<div className="mb-8">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate({ to: "/downloads" })}
					className="mb-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to downloads
				</Button>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-4">
						<div
							className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 ${getProviderColor(download.provider)}`}
						>
							{getIconComponent(download.icon)}
						</div>
						<div>
							<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
								{download.displayName}
							</h1>
							<p className="mt-1 line-clamp-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
								{download.commands[0]?.command.slice(0, 80)}
								{download.commands[0]?.command.length > 80 ? "..." : ""}
							</p>
							<div className="mt-2 flex flex-wrap gap-2">
								<span
									className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs capitalize ${getProviderBadgeStyle(download.provider)}`}
								>
									{getProviderIcon(download.provider)}
									{download.provider}
								</span>
								<span
									className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs capitalize ${
										download.installType === "multi"
											? "bg-green-500/10 text-green-600 dark:text-green-400"
											: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
									}`}
								>
									{download.installType === "multi"
										? "Multi Install"
										: "Single Install"}
								</span>
							</div>
						</div>
					</div>

					{isAdmin && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() =>
									navigate({
										to: "/download-edit/$downloadId",
										params: { downloadId: download.id },
									})
								}
								className="rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
							>
								<PencilSimple className="mr-2 h-4 w-4" />
								Edit
							</Button>
							<Button
								variant="destructive"
								onClick={() => setIsDeleteDialogOpen(true)}
								className="rounded-lg"
							>
								<Trash className="mr-2 h-4 w-4" />
								Delete
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{download.description && (
						<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardHeader>
								<CardTitle className="text-zinc-900 dark:text-zinc-100">
									Description
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									{download.description}
								</p>
							</CardContent>
						</Card>
					)}

					<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
						<CardHeader>
							<CardTitle className="text-zinc-900 dark:text-zinc-100">
								{download.provider === "custom" ? "Script" : `Commands (${download.commands.length})`}
							</CardTitle>
							<CardDescription>
								{download.provider === "custom"
									? "PowerShell script executed on the desktop client"
									: "PowerShell commands executed on the desktop client"}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{download.commands.map((cmd, index) => (
								<div
									key={cmd.id}
									className="group relative overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
								>
									<div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
										<span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
											{download.provider === "custom" ? "PowerShell Script" : `Command ${index + 1}`}
										</span>
										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => copyToClipboard(cmd.command)}
											className="rounded-lg text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
										>
											<Copy className="h-3.5 w-3.5" />
										</Button>
									</div>
									<pre className="max-h-96 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
										{cmd.command}
									</pre>
								</div>
							))}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					{download.cardArtwork && (
						<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-zinc-900 dark:text-zinc-100">
									Card Artwork
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
									<img
										src={download.cardArtwork}
										alt="Card artwork"
										className="h-24 w-full object-cover"
									/>
								</div>
							</CardContent>
						</Card>
					)}

					{download.previewImage && (
						<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm text-zinc-900 dark:text-zinc-100">
									Preview Image
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
									<img
										src={download.previewImage}
										alt="Preview"
										className="h-24 w-full object-cover"
									/>
								</div>
							</CardContent>
						</Card>
					)}

					<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
						<CardHeader>
							<CardTitle className="text-zinc-900 dark:text-zinc-100">
								Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-zinc-600 dark:text-zinc-400">
									Provider
								</span>
								<span className="font-medium text-sm capitalize text-zinc-900 dark:text-zinc-100">
									{download.provider}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-zinc-600 dark:text-zinc-400">
									Install Type
								</span>
								<span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
									{download.installType === "multi" ? "Multi" : "Single"}
								</span>
							</div>
							{download.provider === "custom" && (
								<div className="flex justify-between">
									<span className="text-sm text-zinc-600 dark:text-zinc-400">
										Interactive
									</span>
									<span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
										{download.isInteractive ? "Yes" : "No"}
									</span>
								</div>
							)}
							{download.provider !== "custom" && (
								<div className="flex justify-between">
									<span className="text-sm text-zinc-600 dark:text-zinc-400">
										Commands
									</span>
									<span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
										{download.commands.length}
									</span>
								</div>
							)}
							<div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
								<span className="text-xs text-zinc-500 dark:text-zinc-500">
									Created{" "}
									{new Date(download.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

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
								{download.displayName}
							</span>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
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
