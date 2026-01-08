import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	Check,
	Eye,
	EyeOff,
	Loader2,
	Shield,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { type ApiError, apiClient } from "@/lib/api-client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const initSchema = z
	.object({
		name: z.string().min(1, "Name is required").max(100),
		email: z.string().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128)
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain uppercase, lowercase, and number",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

function getPasswordStrength(password: string): {
	score: number;
	label: string;
	color: string;
} {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
	if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
	return { score, label: "Strong", color: "bg-green-500" };
}

export function InitAuthForm() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await apiClient.initAuth({
					name: value.name,
					email: value.email,
					password: value.password,
				});
				toast.success("Admin account created successfully");
				navigate({ to: "/sign-in" });
			} catch (error) {
				const apiError = error as ApiError;
				toast.error(
					apiError.message ||
						apiError.error ||
						"Failed to create admin account",
				);
			}
		},
		validators: {
			onSubmit: initSchema,
		},
	});

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
					<Shield className="h-6 w-6 text-blue-500" />
				</div>
				<h1 className="font-bold text-2xl text-zinc-900 tracking-tight dark:text-zinc-100">
					Welcome to Talos
				</h1>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Create your administrator account to get started
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
					<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-zinc-700 dark:text-zinc-300">
								Name
							</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="John Doe"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
							/>
							{field.state.meta.errors.map((error) => (
								<p
									key={error?.message}
									className="flex items-center gap-1 text-red-500 text-xs dark:text-red-400"
								>
									<AlertCircle className="h-3 w-3" />
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-zinc-700 dark:text-zinc-300">
								Email
							</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								placeholder="admin@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
							/>
							{field.state.meta.errors.map((error) => (
								<p
									key={error?.message}
									className="flex items-center gap-1 text-red-500 text-xs dark:text-red-400"
								>
									<AlertCircle className="h-3 w-3" />
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

					<form.Field name="password">
					{(field) => {
						const strength = getPasswordStrength(field.state.value);
						return (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-zinc-700 dark:text-zinc-300">
									Password
								</Label>
								<div className="relative">
									<Input
										id={field.name}
										name={field.name}
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="border-zinc-300 bg-zinc-50 pr-10 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{field.state.value && (
									<div className="space-y-1">
										<div className="flex gap-1">
											{[1, 2, 3, 4, 5, 6].map((i) => (
												<div
													key={i}
													className={`h-1 flex-1 rounded-full transition-colors ${
														i <= strength.score ? strength.color : "bg-zinc-300 dark:bg-zinc-700"
													}`}
												/>
											))}
										</div>
										<p className="text-xs text-zinc-600 dark:text-zinc-400">
											Password strength: {strength.label}
										</p>
									</div>
								)}
								{field.state.meta.errors.map((error) => (
									<p
										key={error?.message}
										className="flex items-center gap-1 text-red-500 text-xs dark:text-red-400"
									>
										<AlertCircle className="h-3 w-3" />
										{error?.message}
									</p>
								))}
								<div className="mt-2 space-y-1 text-xs">
									<p
										className={`flex items-center gap-1 ${field.state.value.length >= 8 ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`}
									>
										{field.state.value.length >= 8 ? (
											<Check className="h-3 w-3" />
										) : (
											<X className="h-3 w-3" />
										)}
										At least 8 characters
									</p>
									<p
										className={`flex items-center gap-1 ${/[A-Z]/.test(field.state.value) ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`}
									>
										{/[A-Z]/.test(field.state.value) ? (
											<Check className="h-3 w-3" />
										) : (
											<X className="h-3 w-3" />
										)}
										One uppercase letter
									</p>
									<p
										className={`flex items-center gap-1 ${/[a-z]/.test(field.state.value) ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`}
									>
										{/[a-z]/.test(field.state.value) ? (
											<Check className="h-3 w-3" />
										) : (
											<X className="h-3 w-3" />
										)}
										One lowercase letter
									</p>
									<p
										className={`flex items-center gap-1 ${/\d/.test(field.state.value) ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`}
									>
										{/\d/.test(field.state.value) ? (
											<Check className="h-3 w-3" />
										) : (
											<X className="h-3 w-3" />
										)}
										One number
									</p>
								</div>
							</div>
						);
					}}
				</form.Field>

					<form.Field name="confirmPassword">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-zinc-700 dark:text-zinc-300">
								Confirm Password
							</Label>
							<div className="relative">
								<Input
									id={field.name}
									name={field.name}
									type={showConfirmPassword ? "text" : "password"}
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="border-zinc-300 bg-zinc-50 pr-10 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{field.state.meta.errors.map((error) => (
								<p
									key={error?.message}
									className="flex items-center gap-1 text-red-500 text-xs dark:text-red-400"
								>
									<AlertCircle className="h-3 w-3" />
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								"Create Admin Account"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
