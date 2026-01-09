import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = parseInt(process.env.PORT || "3102", 10);
const HOST = process.env.HOST || "0.0.0.0";
const CLIENT_DIR = join(__dirname, "dist", "client");

const MIME_TYPES = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".eot": "application/vnd.ms-fontobject",
	".webp": "image/webp",
	".webm": "video/webm",
	".mp4": "video/mp4",
	".txt": "text/plain",
	".xml": "application/xml",
};

function isPathSafe(basePath, targetPath) {
	const resolvedBase = resolve(basePath);
	const resolvedTarget = resolve(targetPath);
	return resolvedTarget.startsWith(resolvedBase);
}

function serveStaticFile(filePath, res) {
	if (!isPathSafe(CLIENT_DIR, filePath)) {
		res.statusCode = 403;
		res.end("Forbidden");
		return;
	}

	const ext = extname(filePath).toLowerCase();
	const contentType = MIME_TYPES[ext] || "application/octet-stream";

	const stat = statSync(filePath);
	res.setHeader("Content-Type", contentType);
	res.setHeader("Content-Length", stat.size);
	res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

	createReadStream(filePath).pipe(res);
}

async function startServer() {
	const { default: app } = await import("./dist/server/server.js");

	const server = createServer(async (req, res) => {
		try {
			const url = new URL(req.url || "/", `http://${req.headers.host}`);

			if (req.method === "GET" && url.pathname.startsWith("/assets/")) {
				const filePath = join(CLIENT_DIR, url.pathname);
				if (existsSync(filePath) && statSync(filePath).isFile()) {
					return serveStaticFile(filePath, res);
				}
			}

			if (req.method === "GET") {
				const staticFiles = ["robots.txt", "logo.png", "logo_with_title.png"];
				const fileName = url.pathname.slice(1);
				if (staticFiles.includes(fileName)) {
					const filePath = join(CLIENT_DIR, fileName);
					if (existsSync(filePath)) {
						return serveStaticFile(filePath, res);
					}
				}
			}

			const headers = new Headers();
			for (const [key, value] of Object.entries(req.headers)) {
				if (value) {
					if (Array.isArray(value)) {
						for (const v of value) headers.append(key, v);
					} else {
						headers.set(key, value);
					}
				}
			}

			let body = null;
			if (req.method !== "GET" && req.method !== "HEAD") {
				const chunks = [];
				for await (const chunk of req) {
					chunks.push(chunk);
				}
				body = Buffer.concat(chunks);
			}

			const request = new Request(url.toString(), {
				method: req.method,
				headers,
				body,
				duplex: "half",
			});

			const response = await app.fetch(request);

			res.statusCode = response.status;
			for (const [key, value] of response.headers) {
				res.setHeader(key, value);
			}

			if (response.body) {
				const reader = response.body.getReader();
				const stream = new Readable({
					async read() {
						const { done, value } = await reader.read();
						if (done) {
							this.push(null);
						} else {
							this.push(Buffer.from(value));
						}
					},
				});
				stream.pipe(res);
			} else {
				res.end();
			}
		} catch (error) {
			console.error("Server error:", error);
			res.statusCode = 500;
			res.end("Internal Server Error");
		}
	});

	server.listen(PORT, HOST, () => {
		console.log(`[apimanager] Server running at http://${HOST}:${PORT}`);
	});

	process.on("SIGTERM", () => {
		console.log("[apimanager] SIGTERM received, shutting down...");
		server.close(() => process.exit(0));
	});

	process.on("SIGINT", () => {
		console.log("[apimanager] SIGINT received, shutting down...");
		server.close(() => process.exit(0));
	});
}

startServer().catch((err) => {
	console.error("[apimanager] Failed to start server:", err);
	process.exit(1);
});
