import {
	ArrowsClockwise,
	Copy,
	Plus,
	ShieldCheck,
	Trash,
	User,
	UserCircle,
	Users,
} from "@phosphor-icons/react";
import {
	createFileRoute,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type ApiUser, apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout/user-management")({
	beforeLoad: async ({ context }) => {
		const { session } = context as { session: { user: ApiUser | null } };
		if (session.user?.role !== "admin") {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: UserManagementPage,
});

function generateRandomPassword(): string {
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	const special = "!@#$%^&*";
	const all = lowercase + uppercase + numbers + special;

	let password = "";
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	password += special[Math.floor(Math.random() * special.length)];

	for (let i = 0; i < 8; i++) {
		password += all[Math.floor(Math.random() * all.length)];
	}

	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}

function UserManagementPage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });

	const [users, setUsers] = useState<ApiUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);

	const [newUserName, setNewUserName] = useState("");
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserPassword, setNewUserPassword] = useState("");
	const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
	const [isCreating, setIsCreating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadUsers = useCallback(async () => {
		try {
			const { users: fetchedUsers } = await apiClient.listUsers();
			setUsers(fetchedUsers);
		} catch {
			toast.error("Failed to load users");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleGeneratePassword = () => {
		const password = generateRandomPassword();
		setNewUserPassword(password);
	};

	const handleCopyPassword = async () => {
		if (newUserPassword) {
			await navigator.clipboard.writeText(newUserPassword);
			toast.success("Password copied to clipboard");
		}
	};

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
			toast.error("All fields are required");
			return;
		}

		setIsCreating(true);
		try {
			await apiClient.createUser({
				name: newUserName,
				email: newUserEmail,
				password: newUserPassword,
				role: newUserRole,
			});
			toast.success("User created successfully");
			setIsCreateDialogOpen(false);
			setNewUserName("");
			setNewUserEmail("");
			setNewUserPassword("");
			setNewUserRole("user");
			loadUsers();
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to create user");
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;

		setIsDeleting(true);
		try {
			await apiClient.deleteUser(userToDelete.id);
			toast.success("User deleted successfully");
			setIsDeleteDialogOpen(false);
			setUserToDelete(null);
			loadUsers();
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to delete user");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRoleChange = async (
		userId: string,
		newRole: "admin" | "user",
	) => {
		try {
			await apiClient.updateUserRole(userId, { role: newRole });
			toast.success("Role updated successfully");
			loadUsers();
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to update role");
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

	const formatDate = (dateString?: string): string => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<>
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">User Management</h1>
					<p className="mt-1 text-zinc-600 dark:text-zinc-400">
						Manage users and their permissions
					</p>
				</div>
				<Button
					onClick={() => setIsCreateDialogOpen(true)}
					className="bg-blue-600 text-white hover:bg-blue-700"
				>
					<Plus className="mr-2 h-4 w-4" weight="bold" />
					Add User
				</Button>
			</div>

			<Card className="border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
						<Users className="h-5 w-5" />
						Users
					</CardTitle>
					<CardDescription>
						{users.length} user{users.length !== 1 ? "s" : ""} registered
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<ArrowsClockwise className="h-8 w-8 animate-spin text-zinc-400" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-zinc-200 hover:bg-transparent dark:border-zinc-800">
									<TableHead className="text-zinc-600 dark:text-zinc-400">User</TableHead>
									<TableHead className="text-zinc-600 dark:text-zinc-400">Email</TableHead>
									<TableHead className="text-zinc-600 dark:text-zinc-400">Role</TableHead>
									<TableHead className="text-zinc-600 dark:text-zinc-400">Created</TableHead>
									<TableHead className="text-right text-zinc-600 dark:text-zinc-400">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow
										key={user.id}
										className="border-zinc-200 hover:bg-zinc-100/50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9 border border-zinc-300 dark:border-zinc-700">
													{user.image ? (
														<AvatarImage src={user.image} alt={user.name} />
													) : null}
													<AvatarFallback className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
														{user.image ? (
															getInitials(user.name)
														) : (
															<UserCircle className="h-5 w-5" weight="fill" />
														)}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium text-zinc-900 dark:text-zinc-100">
													{user.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-zinc-600 dark:text-zinc-400">
											{user.email}
										</TableCell>
										<TableCell>
											<Select
												value={user.role}
												onValueChange={(value: "admin" | "user") =>
													handleRoleChange(user.id, value)
												}
												disabled={user.id === session.user?.id}
											>
												<SelectTrigger className="w-28 border-zinc-300 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
													<SelectItem
														value="user"
														className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
													>
														<span className="flex items-center gap-2">
															<User className="h-4 w-4" />
															User
														</span>
													</SelectItem>
													<SelectItem
														value="admin"
														className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
													>
														<span className="flex items-center gap-2">
															<ShieldCheck
																className="h-4 w-4 text-blue-500 dark:text-blue-400"
																weight="fill"
															/>
															Admin
														</span>
													</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell className="text-zinc-600 dark:text-zinc-400">
											{formatDate(user.createdAt)}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => {
													setUserToDelete(user);
													setIsDeleteDialogOpen(true);
												}}
												disabled={user.id === session.user?.id}
												className="text-zinc-500 hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
											>
												<Trash className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
							<Plus className="h-5 w-5" />
							Create New User
						</DialogTitle>
						<DialogDescription>
							Add a new user to the system. They will receive login credentials.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateUser} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="newUserName" className="text-zinc-700 dark:text-zinc-300">
								Name
							</Label>
							<Input
								id="newUserName"
								value={newUserName}
								onChange={(e) => setNewUserName(e.target.value)}
								placeholder="John Doe"
								className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newUserEmail" className="text-zinc-700 dark:text-zinc-300">
								Email
							</Label>
							<Input
								id="newUserEmail"
								type="email"
								value={newUserEmail}
								onChange={(e) => setNewUserEmail(e.target.value)}
								placeholder="john@example.com"
								className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newUserPassword" className="text-zinc-700 dark:text-zinc-300">
								Password
							</Label>
							<div className="flex gap-2">
								<Input
									id="newUserPassword"
									type="text"
									value={newUserPassword}
									onChange={(e) => setNewUserPassword(e.target.value)}
									placeholder="Enter password"
									className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleGeneratePassword}
									className="shrink-0 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
								>
									<ArrowsClockwise className="h-4 w-4" />
								</Button>
								{newUserPassword && (
									<Button
										type="button"
										variant="outline"
										onClick={handleCopyPassword}
										className="shrink-0 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
									>
										<Copy className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newUserRole" className="text-zinc-700 dark:text-zinc-300">
								Role
							</Label>
							<Select
								value={newUserRole}
								onValueChange={(value: "admin" | "user") =>
									setNewUserRole(value)
								}
							>
								<SelectTrigger className="border-zinc-300 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
									<SelectItem
										value="user"
										className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
									>
										<span className="flex items-center gap-2">
											<User className="h-4 w-4" />
											User
										</span>
									</SelectItem>
									<SelectItem
										value="admin"
										className="text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
									>
										<span className="flex items-center gap-2">
											<ShieldCheck
												className="h-4 w-4 text-blue-500 dark:text-blue-400"
												weight="fill"
											/>
											Admin
										</span>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
								className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isCreating}
								className="bg-blue-600 text-white hover:bg-blue-700"
							>
								{isCreating ? "Creating..." : "Create User"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
							<Trash className="h-5 w-5 text-red-500 dark:text-red-400" />
							Delete User
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium text-zinc-900 dark:text-zinc-100">
								{userToDelete?.name}
							</span>
							? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setUserToDelete(null);
							}}
							className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteUser}
							disabled={isDeleting}
							className="bg-red-600 text-white hover:bg-red-700"
						>
							{isDeleting ? "Deleting..." : "Delete User"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
