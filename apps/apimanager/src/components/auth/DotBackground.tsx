import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DotBackgroundProps = {
	children: ReactNode;
	className?: string;
};

export function DotBackground({ children, className }: DotBackgroundProps) {
	return (
		<div
			className={cn(
				"relative flex min-h-svh w-full items-center justify-center bg-zinc-950",
				className,
			)}
		>
			<div
				className={cn(
					"absolute inset-0",
					"[background-size:24px_24px]",
					"[background-image:radial-gradient(#27272a_1.5px,transparent_1.5px)]",
				)}
			/>
			<div className="pointer-events-none absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
			<div className="relative z-10 w-full">{children}</div>
		</div>
	);
}
