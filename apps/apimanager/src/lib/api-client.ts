import { env } from "@Talos/env/web";

export type ApiUser = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	image: string | null;
};

export type SessionResponse = {
	authenticated: boolean;
	user: ApiUser | null;
};

export type SystemStatusResponse = {
	initialized: boolean;
	timestamp: string;
};

export type InitAuthRequest = {
	name: string;
	email: string;
	password: string;
};

export type SignInRequest = {
	email: string;
	password: string;
};

export type ApiError = {
	error: string;
	message?: string;
	details?: Record<string, string[]>;
};

class ApiClient {
	private baseUrl: string;

	constructor() {
		this.baseUrl = env.VITE_SERVER_URL;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		if (!response.ok) {
			const error: ApiError = await response.json().catch(() => ({
				error: "Request failed",
				message: response.statusText,
			}));
			throw error;
		}

		return response.json();
	}

	async getSystemStatus(): Promise<SystemStatusResponse> {
		return this.request<SystemStatusResponse>("/v1/system/status");
	}

	async getSession(): Promise<SessionResponse> {
		return this.request<SessionResponse>("/v1/auth/session");
	}

	async initAuth(
		data: InitAuthRequest,
	): Promise<{ success: boolean; message: string; user: ApiUser }> {
		return this.request("/v1/auth/init", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async signIn(data: SignInRequest): Promise<Response> {
		const url = `${this.baseUrl}/v1/auth/sign-in`;
		const response = await fetch(url, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error: ApiError = await response.json().catch(() => ({
				error: "Sign in failed",
				message: response.statusText,
			}));
			throw error;
		}

		return response;
	}

	async signOut(): Promise<void> {
		const url = `${this.baseUrl}/v1/auth/sign-out`;
		await fetch(url, {
			method: "POST",
			credentials: "include",
		});
	}
}

export const apiClient = new ApiClient();
