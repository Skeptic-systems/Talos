import {
	Camera,
	Envelope,
	Key,
	PencilSimple,
	User,
	UserCircle,
} from "@phosphor-icons/react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(protected)/_layout/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { session } = useRouteContext({ from: "/(protected)/_layout" });
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [name, setName] = useState(session.user?.name ?? "");
	const [email, setEmail] = useState(session.user?.email ?? "");
	const [image, setImage] = useState(session.user?.image ?? null);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			if (file.size > 500000) {
				toast.error("Image must be smaller than 500KB");
				return;
			}

			setIsUploadingAvatar(true);
			try {
				const reader = new FileReader();
				reader.onload = async (e) => {
					const base64 = e.target?.result as string;
					try {
						const { user } = await apiClient.updateAvatar(base64);
						setImage(user.image);
						toast.success("Avatar updated successfully");
					} catch {
						toast.error("Failed to update avatar");
					} finally {
						setIsUploadingAvatar(false);
					}
				};
				reader.readAsDataURL(file);
			} catch {
				toast.error("Failed to read image file");
				setIsUploadingAvatar(false);
			}
		},
		[],
	);

	const handleRemoveAvatar = async () => {
		setIsUploadingAvatar(true);
		try {
			await apiClient.updateAvatar(null);
			setImage(null);
			toast.success("Avatar removed");
		} catch {
			toast.error("Failed to remove avatar");
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}
		if (!email.trim()) {
			toast.error("Email is required");
			return;
		}

		setIsUpdatingProfile(true);
		try {
			const updates: { name?: string; email?: string } = {};
			if (name !== session.user?.name) updates.name = name;
			if (email !== session.user?.email) updates.email = email;

			if (Object.keys(updates).length === 0) {
				toast.info("No changes to save");
				setIsUpdatingProfile(false);
				return;
			}

			await apiClient.updateProfile(updates);
			toast.success("Profile updated successfully");
			window.location.reload();
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to update profile");
		} finally {
			setIsUpdatingProfile(false);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentPassword) {
			toast.error("Current password is required");
			return;
		}
		if (!newPassword) {
			toast.error("New password is required");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		setIsChangingPassword(true);
		try {
			await apiClient.changePassword({ currentPassword, newPassword });
			toast.success("Password changed successfully");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			const apiError = error as { error?: string };
			toast.error(apiError.error ?? "Failed to change password");
		} finally {
			setIsChangingPassword(false);
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
		<>
			<div className="mb-8">
				<h1 className="font-bold text-3xl text-zinc-100">Profile</h1>
				<p className="mt-1 text-zinc-400">Manage your account settings</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-zinc-100">Avatar</CardTitle>
						<CardDescription>
							Click to upload a new profile picture
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-4">
						<button
							type="button"
							onClick={handleAvatarClick}
							disabled={isUploadingAvatar}
							className="group relative cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Avatar className="h-32 w-32 border-2 border-zinc-700">
								{image ? <AvatarImage src={image} alt={name} /> : null}
								<AvatarFallback className="bg-zinc-800 text-4xl text-zinc-300">
									{image ? (
										getInitials(name)
									) : (
										<UserCircle className="h-20 w-20" weight="fill" />
									)}
								</AvatarFallback>
							</Avatar>
							<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
								<Camera className="h-8 w-8 text-white" weight="bold" />
							</div>
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="hidden"
						/>
						{image && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleRemoveAvatar}
								disabled={isUploadingAvatar}
								className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
							>
								Remove avatar
							</Button>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6 lg:col-span-2">
					<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-zinc-100">
								<User className="h-5 w-5" />
								Personal Information
							</CardTitle>
							<CardDescription>Update your personal details</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleUpdateProfile} className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="name"
										className="flex items-center gap-2 text-zinc-300"
									>
										<User className="h-4 w-4" />
										Name
									</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your name"
										className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="flex items-center gap-2 text-zinc-300"
									>
										<Envelope className="h-4 w-4" />
										Email
									</Label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="your@email.com"
										className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
									/>
								</div>
								<Button
									type="submit"
									disabled={isUpdatingProfile}
									className="bg-blue-600 text-white hover:bg-blue-700"
								>
									<PencilSimple className="mr-2 h-4 w-4" />
									{isUpdatingProfile ? "Saving..." : "Save Changes"}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-zinc-100">
								<Key className="h-5 w-5" />
								Change Password
							</CardTitle>
							<CardDescription>
								Update your password to keep your account secure
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleChangePassword} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="currentPassword" className="text-zinc-300">
										Current Password
									</Label>
									<Input
										id="currentPassword"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="Enter current password"
										className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="newPassword" className="text-zinc-300">
										New Password
									</Label>
									<Input
										id="newPassword"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Enter new password"
										className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmPassword" className="text-zinc-300">
										Confirm New Password
									</Label>
									<Input
										id="confirmPassword"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Confirm new password"
										className="border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
									/>
								</div>
								<Button
									type="submit"
									disabled={isChangingPassword}
									className="bg-blue-600 text-white hover:bg-blue-700"
								>
									<Key className="mr-2 h-4 w-4" />
									{isChangingPassword ? "Changing..." : "Change Password"}
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
