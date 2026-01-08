import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
	children: ReactNode;
	className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
	return (
		<div className="flex w-full justify-center px-4">
			<div
				className={cn(
					"w-full max-w-md rounded-xl border p-8 shadow-2xl backdrop-blur-sm",
					"border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/90",
					"fade-in-0 slide-in-from-bottom-4 animate-in duration-500",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
}
