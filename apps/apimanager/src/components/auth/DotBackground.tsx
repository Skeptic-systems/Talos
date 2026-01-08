import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type DotBackgroundProps = {
	children: ReactNode;
	className?: string;
};

export function DotBackground({ children, className }: DotBackgroundProps) {
	return (
		<div
			className={cn(
				"relative flex min-h-svh w-full items-center justify-center",
				"bg-zinc-100 dark:bg-zinc-950",
				className,
			)}
		>
			<div
				className={cn(
					"absolute inset-0",
					"[background-size:24px_24px]",
					"[background-image:radial-gradient(#d4d4d8_1.5px,transparent_1.5px)]",
					"dark:[background-image:radial-gradient(#27272a_1.5px,transparent_1.5px)]",
				)}
			/>
			<div
				className={cn(
					"pointer-events-none absolute inset-0",
					"bg-zinc-100 dark:bg-zinc-950",
					"[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
				)}
			/>
			<div className="absolute top-4 right-4 z-20">
				<ThemeToggle size="sm" />
			</div>
			<div className="relative z-10 w-full">{children}</div>
		</div>
	);
}
