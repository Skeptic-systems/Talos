import { Plus, Trash } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CommandListProps = {
	commands: string[];
	onChange: (commands: string[]) => void;
	provider: "winget" | "chocolatey";
};

export function CommandList({ commands, onChange, provider }: CommandListProps) {
	const handleCommandChange = (index: number, value: string) => {
		const newCommands = [...commands];
		newCommands[index] = value;
		onChange(newCommands);
	};

	const handleAddCommand = () => {
		onChange([...commands, ""]);
	};

	const handleRemoveCommand = (index: number) => {
		if (commands.length <= 2) return;
		const newCommands = commands.filter((_, i) => i !== index);
		onChange(newCommands);
	};

	const getPlaceholder = (index: number): string => {
		switch (provider) {
			case "winget":
				return `winget install --id Package.Id${index > 0 ? index + 1 : ""} --accept-source-agreements --accept-package-agreements`;
			case "chocolatey":
				return `choco install package-name${index > 0 ? index + 1 : ""} -y`;
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="text-zinc-700 dark:text-zinc-300">
					Download commands *
				</Label>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					Multi-install mode ({commands.length} commands)
				</p>
			</div>
			<p className="text-xs text-zinc-500 dark:text-zinc-400">
				Add the commands to execute sequentially on the desktop client.
			</p>

			<div className="space-y-2">
				{commands.map((command, index) => (
					<div key={index} className="flex gap-2">
						<div className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200/70 font-medium text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
							{index + 1}
						</div>
						<Input
							value={command}
							onChange={(e) => handleCommandChange(index, e.target.value)}
							placeholder={getPlaceholder(index)}
							className="flex-1 rounded-lg border-zinc-300 bg-zinc-50 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => handleRemoveCommand(index)}
							disabled={commands.length <= 2}
							className="shrink-0 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-red-400"
						>
							<Trash className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>

			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={handleAddCommand}
				className="w-full rounded-lg border-dashed border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
			>
				<Plus className="mr-2 h-4 w-4" weight="bold" />
				Add another command
			</Button>
		</div>
	);
}
