import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { type ApiError, apiClient } from "@/lib/api-client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export function SignInForm() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await apiClient.signIn({
					email: value.email,
					password: value.password,
				});
				toast.success("Signed in successfully");
				navigate({ to: "/dashboard" });
			} catch (error) {
				const apiError = error as ApiError;
				toast.error(
					apiError.message || apiError.error || "Invalid credentials",
				);
			}
		},
		validators: {
			onSubmit: signInSchema,
		},
	});

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
					<LogIn className="h-6 w-6 text-blue-500" />
				</div>
				<h1 className="font-bold text-2xl text-zinc-900 tracking-tight dark:text-zinc-100">
					Welcome Back
				</h1>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in to your account</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
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
					{(field) => (
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
									Signing In...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
