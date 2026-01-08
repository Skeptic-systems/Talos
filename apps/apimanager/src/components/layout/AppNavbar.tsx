import { SignOut, User, UserCircle, Users } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiUser } from "@/lib/api-client";
import { apiClient } from "@/lib/api-client";

type AppNavbarProps = {
	user: ApiUser;
};

export function AppNavbar({ user }: AppNavbarProps) {
	const navigate = useNavigate();

	const handleSignOut = async () => {
		try {
			await apiClient.signOut();
			toast.success("Signed out successfully");
			window.location.href = "/sign-in";
		} catch {
			toast.error("Failed to sign out");
		}
	};

	const getInitials = (name: string): string => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<header className="sticky top-0 z-50 border-zinc-800 border-b bg-zinc-900/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				<Link to="/dashboard" className="flex items-center gap-3">
					<img
						src="/icon.png"
						alt="Talos"
						className="h-9 w-auto object-contain"
					/>
					<span className="font-bold text-xl text-zinc-100">Talos</span>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-800/50 focus:outline-none">
						<div className="hidden text-right sm:block">
							<p className="font-medium text-sm text-zinc-100">{user.name}</p>
							<p className="text-xs text-zinc-400 capitalize">{user.role}</p>
						</div>
						<Avatar className="h-9 w-9 border border-zinc-700">
							{user.image ? (
								<AvatarImage src={user.image} alt={user.name} />
							) : null}
							<AvatarFallback className="bg-zinc-800 text-zinc-300">
								{user.image ? (
									getInitials(user.name)
								) : (
									<UserCircle className="h-6 w-6" weight="fill" />
								)}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" side="bottom" sideOffset={8}>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col gap-1">
								<p className="font-medium text-sm">{user.name}</p>
								<p className="text-muted-foreground text-xs">{user.email}</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => navigate({ to: "/profile" })}
							className="cursor-pointer"
						>
							<User className="mr-2 h-4 w-4" />
							Profile
						</DropdownMenuItem>

						{user.role === "admin" && (
							<DropdownMenuItem
								onClick={() => navigate({ to: "/user-management" })}
								className="cursor-pointer"
							>
								<Users className="mr-2 h-4 w-4" />
								User Management
							</DropdownMenuItem>
						)}

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={handleSignOut}
							variant="destructive"
							className="cursor-pointer"
						>
							<SignOut className="mr-2 h-4 w-4" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
