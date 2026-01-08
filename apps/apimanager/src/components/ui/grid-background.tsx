import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GridBackgroundProps = {
	children: ReactNode;
	className?: string;
};

export function GridBackground({ children, className }: GridBackgroundProps) {
	return (
		<div className={cn("relative min-h-svh w-full bg-zinc-950", className)}>
			<div
				className={cn(
					"pointer-events-none absolute inset-0",
					"[background-size:40px_40px]",
					"[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
				)}
			/>
			<div className="pointer-events-none absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			<div className="relative z-10">{children}</div>
		</div>
	);
}
