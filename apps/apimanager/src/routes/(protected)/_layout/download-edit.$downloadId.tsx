import { ArrowLeft, ArrowsClockwise, Check } from "@phosphor-icons/react";
import {
	createFileRoute,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CommandList } from "@/components/downloads/CommandList";
import { IconPicker } from "@/components/downloads/IconPicker";
import { ImageUpload } from "@/components/downloads/ImageUpload";
import { PowerShellEditor } from "@/components/downloads/PowerShellEditor";
import { ProviderSelector } from "@/components/downloads/ProviderSelector";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type ApiUser,
	type DownloadProvider,
	type InstallType,
	apiClient,
} from "@/lib/api-client";

export const Route = createFileRoute(
	"/(protected)/_layout/download-edit/$downloadId",
)({
	beforeLoad: async ({ context }) => {
		const { session } = context as { session: { user: ApiUser | null } };
		if (session.user?.role !== "admin") {
			throw redirect({ to: "/downloads" });
		}
	},
	component: DownloadEditPage,
});

function DownloadEditPage() {
	const { downloadId } = Route.useParams();
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(true);
	const [provider, setProvider] = useState<DownloadProvider>("winget");
	const [displayName, setDisplayName] = useState("");
	const [packageId, setPackageId] = useState("");
	const [description, setDescription] = useState("");
	const [singleCommand, setSingleCommand] = useState("");
	const [commands, setCommands] = useState<string[]>(["", ""]);
	const [installType, setInstallType] = useState<InstallType>("single");
	const [cardArtwork, setCardArtwork] = useState<string | null>(null);
	const [icon, setIcon] = useState<string | null>("Package");
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [scriptContent, setScriptContent] = useState("");
	const [isInteractive, setIsInteractive] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const loadDownload = useCallback(async () => {
		try {
			const { download } = await apiClient.getDownload(downloadId);
			setProvider(download.provider);
			setDisplayName(download.displayName);
			setPackageId(download.packageId ?? "");
			setDescription(download.description ?? "");

			const loadedCommands = download.commands.map((c) => c.command);

			if (download.provider === "custom") {
				setScriptContent(loadedCommands[0] ?? download.scriptContent ?? "");
				setInstallType("single");
			} else if (download.installType === "multi" && loadedCommands.length >= 2) {
				setCommands(loadedCommands);
				setInstallType("multi");
			} else {
				setSingleCommand(loadedCommands[0] ?? "");
				setInstallType("single");
			}

			setCardArtwork(download.cardArtwork);
			setIcon(download.icon);
			setPreviewImage(download.previewImage);
			setIsInteractive(download.isInteractive);
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

	const handleProviderChange = (newProvider: DownloadProvider) => {
		setProvider(newProvider);
		if (newProvider === "custom") {
			setPackageId("");
			setInstallType("single");
		}
	};

	const handleInstallTypeChange = (newType: InstallType) => {
		setInstallType(newType);
		if (newType === "single") {
			setCommands(["", ""]);
		} else {
			setCommands([singleCommand || "", ""]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!displayName.trim()) {
			toast.error("Display name is required");
			return;
		}

		let finalCommands: string[] = [];

		if (provider === "custom") {
			if (!scriptContent.trim()) {
				toast.error("PowerShell script is required");
				return;
			}
			finalCommands = [scriptContent.trim()];
		} else if (installType === "single") {
			if (!singleCommand.trim()) {
				toast.error("Download command is required");
				return;
			}
			finalCommands = [singleCommand.trim()];
		} else {
			finalCommands = commands.filter((cmd) => cmd.trim());
			if (finalCommands.length < 2) {
				toast.error("Multi-install requires at least 2 commands");
				return;
			}
		}

		setIsSubmitting(true);
		try {
			await apiClient.updateDownload(downloadId, {
				displayName: displayName.trim(),
				packageId: provider !== "custom" ? (packageId.trim() || null) : null,
				description: description.trim() || null,
				provider,
				installType: provider === "custom" ? "single" : installType,
				cardArtwork,
				icon,
				previewImage,
				scriptPath: null,
				scriptContent: provider === "custom" ? scriptContent.trim() : null,
				isInteractive: provider === "custom" ? isInteractive : false,
				commands: finalCommands,
			});

			toast.success("Download updated successfully");
			navigate({
				to: "/download-detail/$downloadId",
				params: { downloadId },
			});
		} catch (error) {
			const apiError = error as { error?: string; details?: Record<string, string[]> };
			if (apiError.details) {
				const firstError = Object.values(apiError.details)[0]?.[0];
				toast.error(firstError ?? "Failed to update download");
			} else {
				toast.error(apiError.error ?? "Failed to update download");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<ArrowsClockwise className="h-8 w-8 animate-spin text-zinc-400" />
			</div>
		);
	}

	return (
		<>
			<div className="mb-8">
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						navigate({
							to: "/download-detail/$downloadId",
							params: { downloadId },
						})
					}
					className="mb-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to download
				</Button>

				<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
					Edit download blueprint
				</h1>
				<p className="mt-1 text-zinc-600 dark:text-zinc-400">
					Update the configuration for this download blueprint.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<CardContent className="space-y-6 pt-6">
						<ProviderSelector
							value={provider}
							onChange={handleProviderChange}
						/>

						{provider !== "custom" && (
							<div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
								<div>
									<p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
										Install Type
									</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{installType === "single"
											? "Single package installation"
											: "Multiple packages in one blueprint"}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<span
										className={`text-sm ${installType === "single" ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
									>
										Single
									</span>
									<button
										type="button"
										onClick={() =>
											handleInstallTypeChange(
												installType === "single" ? "multi" : "single",
											)
										}
										className={`relative flex h-7 w-12 items-center rounded-full transition-colors ${
											installType === "multi"
												? "bg-blue-600"
												: "bg-zinc-300 dark:bg-zinc-700"
										}`}
									>
										<span
											className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
												installType === "multi"
													? "translate-x-6"
													: "translate-x-1"
											}`}
										/>
									</button>
									<span
										className={`text-sm ${installType === "multi" ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
									>
										Multi
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<CardHeader>
						<CardTitle className="text-zinc-900 dark:text-zinc-100">
							Basic Information
						</CardTitle>
						<CardDescription>
							{provider === "custom"
								? "Configure the display name and description"
								: "Configure the display name, package ID, and description"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{provider === "custom" ? (
							<div className="space-y-2">
								<Label
									htmlFor="displayName"
									className="text-zinc-700 dark:text-zinc-300"
								>
									Display name *
								</Label>
								<Input
									id="displayName"
									value={displayName}
									onChange={(e) => setDisplayName(e.target.value)}
									placeholder="Custom Installation Script"
									className="rounded-lg border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
								/>
							</div>
						) : (
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="displayName"
										className="text-zinc-700 dark:text-zinc-300"
									>
										Display name *
									</Label>
									<Input
										id="displayName"
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="Visual Studio Code"
										className="rounded-lg border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="packageId"
										className="text-zinc-700 dark:text-zinc-300"
									>
										Package Id *
									</Label>
									<Input
										id="packageId"
										value={packageId}
										onChange={(e) => setPackageId(e.target.value)}
										placeholder={
											provider === "winget"
												? "Microsoft.VisualStudioCode"
												: "vscode"
										}
										className="rounded-lg border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
									/>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										Identifier used for package management.
									</p>
								</div>
							</div>
						)}

						{provider === "custom" && (
							<div className="space-y-2">
								<Label className="text-zinc-700 dark:text-zinc-300">
									Interactive mode
								</Label>
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setIsInteractive(!isInteractive)}
										className={`relative flex h-7 w-12 items-center rounded-full transition-colors ${
											isInteractive
												? "bg-blue-600"
												: "bg-zinc-300 dark:bg-zinc-700"
										}`}
									>
										<span
											className={`absolute h-5 w-5 rounded-full bg-white shadow transition-transform ${
												isInteractive
													? "translate-x-6"
													: "translate-x-1"
											}`}
										/>
									</button>
									<span className="text-sm text-zinc-600 dark:text-zinc-400">
										{isInteractive ? "Yes" : "No"}
									</span>
								</div>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Enable for scripts that require user interaction.
								</p>
							</div>
						)}

						{provider !== "custom" && installType === "single" && (
							<div className="space-y-2">
								<Label
									htmlFor="singleCommand"
									className="text-zinc-700 dark:text-zinc-300"
								>
									Download command *
								</Label>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									The exact command executed on the desktop client.
								</p>
								<Input
									id="singleCommand"
									value={singleCommand}
									onChange={(e) => setSingleCommand(e.target.value)}
									placeholder={
										provider === "winget"
											? "winget install --id Package.Id --accept-source-agreements --accept-package-agreements"
											: "choco install package-name -y"
									}
									className="rounded-lg border-zinc-300 bg-zinc-50 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
								/>
							</div>
						)}

						{provider !== "custom" && installType === "multi" && (
							<CommandList
								commands={commands}
								onChange={setCommands}
								provider={provider}
							/>
						)}

						{provider === "custom" && (
							<PowerShellEditor
								value={scriptContent}
								onChange={setScriptContent}
							/>
						)}

						<div className="space-y-2">
							<Label
								htmlFor="description"
								className="text-zinc-700 dark:text-zinc-300"
							>
								Description
							</Label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Explain what gets installed, prerequisites, and special notes."
								rows={3}
								className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="overflow-hidden rounded-xl border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
					<CardHeader>
						<CardTitle className="text-zinc-900 dark:text-zinc-100">
							Appearance
						</CardTitle>
						<CardDescription>
							Configure the visual appearance for the desktop app
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<IconPicker value={icon} onChange={setIcon} />

						<div className="grid gap-4 sm:grid-cols-2">
							<ImageUpload
								label="Card artwork"
								description="Hero artwork shown on cards"
								value={cardArtwork}
								onChange={setCardArtwork}
								optional
								compact
							/>

							<ImageUpload
								label="Preview image"
								description="Image shown in detail view"
								value={previewImage}
								onChange={setPreviewImage}
								optional
								compact
							/>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center justify-end gap-3 pb-8">
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							navigate({
								to: "/download-detail/$downloadId",
								params: { downloadId },
							})
						}
						className="rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
					>
						{isSubmitting ? (
							<>
								<ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Check className="mr-2 h-4 w-4" weight="bold" />
								Save changes
							</>
						)}
					</Button>
				</div>
			</form>
		</>
	);
}
