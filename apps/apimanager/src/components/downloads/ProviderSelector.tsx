import { Code, Package, Terminal } from "@phosphor-icons/react";

import type { DownloadProvider } from "@/lib/api-client";

type ProviderSelectorProps = {
	value: DownloadProvider;
	onChange: (value: DownloadProvider) => void;
};

const PROVIDERS = [
	{
		id: "winget" as const,
		name: "Winget",
		description: "Install from the Microsoft Store & Winget community repository.",
		icon: Package,
		color: "blue",
	},
	{
		id: "chocolatey" as const,
		name: "Chocolatey",
		description: "Handle desktop software via Chocolatey packages and scripts.",
		icon: Terminal,
		color: "amber",
	},
	{
		id: "custom" as const,
		name: "Custom",
		description: "Ship bespoke PowerShell automations with interactive toggles.",
		icon: Code,
		color: "purple",
	},
];

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
	const getColorClasses = (
		color: string,
		isSelected: boolean,
	): { border: string; bg: string; icon: string } => {
		const colors: Record<
			string,
			{ border: string; bg: string; icon: string }
		> = {
			blue: {
				border: isSelected
					? "border-blue-500 ring-2 ring-blue-500/20"
					: "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700",
				bg: "bg-blue-500/10",
				icon: "text-blue-500",
			},
			amber: {
				border: isSelected
					? "border-amber-500 ring-2 ring-amber-500/20"
					: "border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700",
				bg: "bg-amber-500/10",
				icon: "text-amber-500",
			},
			purple: {
				border: isSelected
					? "border-purple-500 ring-2 ring-purple-500/20"
					: "border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700",
				bg: "bg-purple-500/10",
				icon: "text-purple-500",
			},
		};
		return colors[color] ?? colors.blue;
	};

	return (
		<div className="space-y-3">
			<p className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
				PROVIDER
			</p>
			<div className="grid gap-4 sm:grid-cols-3">
				{PROVIDERS.map((provider) => {
					const isSelected = value === provider.id;
					const colorClasses = getColorClasses(provider.color, isSelected);
					const IconComponent = provider.icon;

					return (
						<button
							key={provider.id}
							type="button"
							onClick={() => onChange(provider.id)}
							className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${colorClasses.border} bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50`}
						>
							{isSelected && (
								<div
									className={`absolute top-3 right-3 h-2 w-2 rounded-full ${provider.color === "blue" ? "bg-blue-500" : provider.color === "amber" ? "bg-amber-500" : "bg-purple-500"}`}
								/>
							)}
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses.bg}`}
							>
								<IconComponent
									className={`h-5 w-5 ${colorClasses.icon}`}
									weight="bold"
								/>
							</div>
							<p className="mt-3 font-medium text-sm text-zinc-900 dark:text-zinc-100">
								{provider.name}
							</p>
							<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
								{provider.description}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}
