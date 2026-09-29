import { createServer } from "node:http";
import { handler } from "./app.js";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = join(__dirname, "..", "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function getCacheControl(pathname) {
  const ext = extname(pathname).toLowerCase();
  // HTML: no cache, assets: long cache (assuming hashed filenames in future)
  if (ext === ".html") return "no-cache, no-store, must-revalidate";
  return "public, max-age=31536000, immutable";
}

async function serveStatic(req, res, pathname) {
  // Prevent directory traversal
  const safePath = join(PUBLIC_DIR, pathname);
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return true;
  }

  try {
    const stats = await stat(safePath);
    if (!stats.isFile()) {
      return false; // Not a file, let caller handle
    }

    const content = await readFile(safePath);
    const ext = extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": getCacheControl(pathname),
      "ETag": `W/"${stats.size}-${stats.mtimeMs}"`,
      "Last-Modified": stats.mtime.toUTCString(),
    });
    res.end(content);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      return false; // Not found, let caller handle
    }
    throw err;
  }
}

const port = Number(process.env.PORT ?? 3000);
createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API routes - delegate to existing handler
  if (pathname.startsWith("/api/")) {
    return handler(req, res);
  }

  // Root path serves index.html
  if (pathname === "/" || pathname === "") {
    const served = await serveStatic(req, res, "index.html");
    if (!served) {
      res.writeHead(404);
      res.end("Not Found");
    }
    return;
  }

  // Other static files
  const served = await serveStatic(req, res, pathname.slice(1));
  if (!served) {
    res.writeHead(404);
    res.end("Not Found");
  }
}).listen(port, () => {
  console.log(`Patients API listening on ${port}`);
});
