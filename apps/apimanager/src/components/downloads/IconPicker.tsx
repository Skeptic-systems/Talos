import {
	Browser,
	Code,
	Cube,
	Database,
	Desktop,
	Download,
	FileCode,
	FolderOpen,
	Gear,
	Globe,
	Lightning,
	Lock,
	Package,
	Shield,
	Terminal,
} from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const ICON_PRESETS = [
	{ name: "Package", icon: Package },
	{ name: "Terminal", icon: Terminal },
	{ name: "Code", icon: Code },
	{ name: "Browser", icon: Browser },
	{ name: "FileCode", icon: FileCode },
	{ name: "Desktop", icon: Desktop },
	{ name: "Gear", icon: Gear },
	{ name: "Download", icon: Download },
	{ name: "FolderOpen", icon: FolderOpen },
	{ name: "Database", icon: Database },
	{ name: "Globe", icon: Globe },
	{ name: "Lock", icon: Lock },
	{ name: "Shield", icon: Shield },
	{ name: "Lightning", icon: Lightning },
	{ name: "Cube", icon: Cube },
] as const;

type IconPickerProps = {
	value: string | null;
	onChange: (value: string | null) => void;
	onUpload?: (base64: string) => void;
};

export function IconPicker({ value, onChange, onUpload }: IconPickerProps) {
	const [mode, setMode] = useState<"preset" | "upload">("preset");

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
			onUpload?.(base64);
		};
		reader.readAsDataURL(file);
	};

	const selectedPreset = ICON_PRESETS.find((p) => p.name === value);
	const isBase64 = value?.startsWith("data:");

	return (
		<div className="space-y-3">
			<Label className="text-zinc-700 dark:text-zinc-300">Icon</Label>
			<p className="text-xs text-zinc-500 dark:text-zinc-400">
				Choose a Phosphor glyph or upload your own transparent PNG/SVG.
			</p>

			<div className="flex gap-2">
				<Button
					type="button"
					variant={mode === "preset" ? "default" : "outline"}
					size="sm"
					onClick={() => setMode("preset")}
					className={
						mode === "preset"
							? "rounded-lg bg-blue-600 text-white hover:bg-blue-700"
							: "rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
					}
				>
					Phosphor Icon
				</Button>
				<Button
					type="button"
					variant={mode === "upload" ? "default" : "outline"}
					size="sm"
					onClick={() => setMode("upload")}
					className={
						mode === "upload"
							? "rounded-lg bg-blue-600 text-white hover:bg-blue-700"
							: "rounded-lg border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
					}
				>
					Upload Image
				</Button>
			</div>

			{mode === "preset" ? (
				<div className="space-y-3">
					<Label className="text-zinc-700 dark:text-zinc-300">Icon preset</Label>
					<Select
						value={isBase64 ? "" : value ?? ""}
						onValueChange={(v) => onChange(v || null)}
					>
						<SelectTrigger className="rounded-lg border-zinc-300 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100">
							<SelectValue placeholder="Select an icon" />
						</SelectTrigger>
						<SelectContent className="rounded-xl border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
							{ICON_PRESETS.map((preset) => {
								const IconComponent = preset.icon;
								return (
									<SelectItem
										key={preset.name}
										value={preset.name}
										className="rounded-lg text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
									>
										<span className="flex items-center gap-2">
											<IconComponent className="h-4 w-4" weight="bold" />
											{preset.name}
										</span>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>

					{selectedPreset && (
						<div className="flex h-20 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
							<selectedPreset.icon
								className="h-10 w-10 text-zinc-600 dark:text-zinc-300"
								weight="bold"
							/>
						</div>
					)}
				</div>
			) : (
				<div className="space-y-3">
					<input
						type="file"
						accept="image/png,image/svg+xml,image/jpeg,image/webp"
						onChange={handleFileUpload}
						className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-2 text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1 file:text-sm file:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:file:bg-zinc-700 dark:file:text-zinc-300"
					/>
					{isBase64 && (
						<div className="flex h-20 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
							<img
								src={value}
								alt="Uploaded icon"
								className="h-10 w-10 object-contain"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export function getIconComponent(iconName: string | null): React.ReactNode {
	if (!iconName) return null;
	if (iconName.startsWith("data:")) {
		return <img src={iconName} alt="Icon" className="h-5 w-5 object-contain" />;
	}
	const preset = ICON_PRESETS.find((p) => p.name === iconName);
	if (preset) {
		const IconComponent = preset.icon;
		return <IconComponent className="h-5 w-5" weight="bold" />;
	}
	return <Package className="h-5 w-5" weight="bold" />;
}
