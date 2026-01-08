import { Image, Link, Trash, Upload } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploadProps = {
	label: string;
	description?: string;
	value: string | null;
	onChange: (value: string | null) => void;
	optional?: boolean;
	compact?: boolean;
};

export function ImageUpload({
	label,
	description,
	value,
	onChange,
	optional,
	compact,
}: ImageUploadProps) {
	const [mode, setMode] = useState<"url" | "upload">(
		value?.startsWith("data:") ? "upload" : "url",
	);
	const [urlInput, setUrlInput] = useState(
		value && !value.startsWith("data:") ? value : "",
	);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const base64 = reader.result as string;
			onChange(base64);
		};
		reader.readAsDataURL(file);
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setUrlInput(url);
		if (url.trim()) {
			onChange(url);
		} else {
			onChange(null);
		}
	};

	const handleClear = () => {
		onChange(null);
		setUrlInput("");
	};

	const isBase64 = value?.startsWith("data:");

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label className="text-zinc-700 dark:text-zinc-300">
					{label}
					{optional && (
						<span className="ml-1 text-zinc-400 dark:text-zinc-500">
							(optional)
						</span>
					)}
				</Label>
				{value && (
					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={handleClear}
						className="rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
					>
						<Trash className="mr-1 h-3 w-3" />
						Clear
					</Button>
				)}
			</div>
			{description && (
				<p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
			)}

			<div className="flex gap-2">
				<Button
					type="button"
					variant={mode === "url" ? "default" : "outline"}
					size="xs"
					onClick={() => setMode("url")}
					className={
						mode === "url"
							? "rounded-lg bg-blue-600 text-white hover:bg-blue-700"
							: "rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
					}
				>
					<Link className="mr-1 h-3 w-3" />
					URL
				</Button>
				<Button
					type="button"
					variant={mode === "upload" ? "default" : "outline"}
					size="xs"
					onClick={() => setMode("upload")}
					className={
						mode === "upload"
							? "rounded-lg bg-blue-600 text-white hover:bg-blue-700"
							: "rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
					}
				>
					<Upload className="mr-1 h-3 w-3" />
					Upload
				</Button>
			</div>

			{mode === "url" ? (
				<Input
					type="url"
					value={urlInput}
					onChange={handleUrlChange}
					placeholder="https://example.com/image.png"
					className="rounded-lg border-zinc-300 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
				/>
			) : (
				<input
					type="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					onChange={handleFileUpload}
					className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-1.5 text-xs text-zinc-700 file:mr-2 file:rounded file:border-0 file:bg-zinc-200 file:px-2 file:py-0.5 file:text-xs file:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-300"
				/>
			)}

			{value && (
				<div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
					<div className={`flex items-center justify-center p-2 ${compact ? "h-20" : "h-28"}`}>
						<img
							src={value}
							alt="Preview"
							className="max-h-full max-w-full object-contain"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					</div>
				</div>
			)}

			{!value && (
				<div className={`flex items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30 ${compact ? "h-20" : "h-28"}`}>
					<div className="text-center">
						<Image className="mx-auto h-5 w-5 text-zinc-400" />
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							No image
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
