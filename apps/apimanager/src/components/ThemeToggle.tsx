import { Moon, Sun } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
	className?: string;
	size?: "sm" | "md";
};

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme();

	const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
	const buttonSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className={cn(
				buttonSize,
				"rounded-lg transition-colors",
				"hover:bg-zinc-800/50 dark:hover:bg-zinc-800/50",
				"bg-zinc-100 dark:bg-transparent",
				className,
			)}
			aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
		>
			{theme === "dark" ? (
				<Sun className={cn(iconSize, "text-zinc-300")} weight="fill" />
			) : (
				<Moon className={cn(iconSize, "text-zinc-700")} weight="fill" />
			)}
		</Button>
	);
}
