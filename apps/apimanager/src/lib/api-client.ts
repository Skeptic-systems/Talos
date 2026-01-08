import { env } from "@Talos/env/web";

export type ApiUser = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	image: string | null;
	createdAt?: string;
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

export type UpdateProfileRequest = {
	name?: string;
	email?: string;
};

export type ChangePasswordRequest = {
	currentPassword: string;
	newPassword: string;
};

export type CreateUserRequest = {
	name: string;
	email: string;
	password: string;
	role: "admin" | "user";
};

export type UpdateRoleRequest = {
	role: "admin" | "user";
};

export type DownloadProvider = "winget" | "chocolatey" | "custom";
export type InstallType = "single" | "multi";

export type DownloadCommand = {
	id: string;
	downloadId: string;
	command: string;
	sortOrder: number;
};

export type Download = {
	id: string;
	displayName: string;
	packageId: string | null;
	description: string | null;
	provider: DownloadProvider;
	installType: InstallType;
	cardArtwork: string | null;
	icon: string | null;
	previewImage: string | null;
	scriptPath: string | null;
	scriptContent?: string | null;
	isInteractive: boolean;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	commands: DownloadCommand[];
};

export type DownloadListItem = Omit<Download, "scriptContent">;

export type CreateDownloadRequest = {
	displayName: string;
	packageId?: string | null;
	description?: string | null;
	provider: DownloadProvider;
	installType?: InstallType;
	cardArtwork?: string | null;
	icon?: string | null;
	previewImage?: string | null;
	scriptPath?: string | null;
	scriptContent?: string | null;
	isInteractive?: boolean;
	commands: string[];
};

export type UpdateDownloadRequest = Partial<CreateDownloadRequest>;

export type DownloadStats = {
	totalDownloads: number;
	singleInstall: number;
	multiInstall: number;
	activeUsers: number;
};

export type RecentDownload = {
	id: string;
	displayName: string;
	provider: DownloadProvider;
	installType: InstallType;
	icon: string | null;
	createdAt: string;
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

	async getProfile(): Promise<{ user: ApiUser }> {
		return this.request<{ user: ApiUser }>("/v1/users/me");
	}

	async updateProfile(data: UpdateProfileRequest): Promise<{ user: ApiUser }> {
		return this.request<{ user: ApiUser }>("/v1/users/me", {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async changePassword(
		data: ChangePasswordRequest,
	): Promise<{ success: boolean; message: string }> {
		return this.request<{ success: boolean; message: string }>(
			"/v1/users/me/password",
			{
				method: "PUT",
				body: JSON.stringify(data),
			},
		);
	}

	async updateAvatar(image: string | null): Promise<{ user: ApiUser }> {
		return this.request<{ user: ApiUser }>("/v1/users/me/avatar", {
			method: "POST",
			body: JSON.stringify({ image }),
		});
	}

	async listUsers(): Promise<{ users: ApiUser[] }> {
		return this.request<{ users: ApiUser[] }>("/v1/users");
	}

	async createUser(data: CreateUserRequest): Promise<{ user: ApiUser }> {
		return this.request<{ user: ApiUser }>("/v1/users", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async deleteUser(
		userId: string,
	): Promise<{ success: boolean; message: string }> {
		return this.request<{ success: boolean; message: string }>(
			`/v1/users/${userId}`,
			{
				method: "DELETE",
			},
		);
	}

	async updateUserRole(
		userId: string,
		data: UpdateRoleRequest,
	): Promise<{ user: ApiUser }> {
		return this.request<{ user: ApiUser }>(`/v1/users/${userId}/role`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async getDownloadStats(): Promise<{ stats: DownloadStats }> {
		return this.request<{ stats: DownloadStats }>("/v1/downloads/stats");
	}

	async getRecentDownloads(): Promise<{ downloads: RecentDownload[] }> {
		return this.request<{ downloads: RecentDownload[] }>("/v1/downloads/recent");
	}

	async listDownloads(): Promise<{ downloads: DownloadListItem[] }> {
		return this.request<{ downloads: DownloadListItem[] }>("/v1/downloads");
	}

	async getDownload(downloadId: string): Promise<{ download: Download }> {
		return this.request<{ download: Download }>(`/v1/downloads/${downloadId}`);
	}

	async createDownload(
		data: CreateDownloadRequest,
	): Promise<{ download: Download }> {
		return this.request<{ download: Download }>("/v1/downloads", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async updateDownload(
		downloadId: string,
		data: UpdateDownloadRequest,
	): Promise<{ download: Download }> {
		return this.request<{ download: Download }>(`/v1/downloads/${downloadId}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async deleteDownload(
		downloadId: string,
	): Promise<{ success: boolean; message: string }> {
		return this.request<{ success: boolean; message: string }>(
			`/v1/downloads/${downloadId}`,
			{
				method: "DELETE",
			},
		);
	}
}

export const apiClient = new ApiClient();
