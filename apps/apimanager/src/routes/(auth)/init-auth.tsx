import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/AuthCard";
import { DotBackground } from "@/components/auth/DotBackground";
import { InitAuthForm } from "@/components/auth/InitAuthForm";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(auth)/init-auth")({
	beforeLoad: async () => {
		const status = await apiClient.getSystemStatus();
		if (status.initialized) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: InitAuthPage,
});

function InitAuthPage() {
	return (
		<DotBackground>
			<AuthCard>
				<InitAuthForm />
			</AuthCard>
		</DotBackground>
	);
}
