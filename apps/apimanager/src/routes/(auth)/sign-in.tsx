import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthCard } from "@/components/auth/AuthCard";
import { DotBackground } from "@/components/auth/DotBackground";
import { SignInForm } from "@/components/auth/SignInForm";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/(auth)/sign-in")({
	beforeLoad: async () => {
		const status = await apiClient.getSystemStatus();
		if (!status.initialized) {
			throw redirect({ to: "/init-auth" });
		}

		const session = await apiClient.getSession();
		if (session.authenticated) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: SignInPage,
});

function SignInPage() {
	return (
		<DotBackground>
			<AuthCard>
				<SignInForm />
			</AuthCard>
		</DotBackground>
	);
}
