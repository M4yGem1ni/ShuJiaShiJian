import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

// 在 pkg 独立可执行文件中自动配置运行环境
if ((process as any).pkg) {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    const bundledExample = path.join(__dirname, "../.env.example");
    if (fs.existsSync(bundledExample)) {
      fs.copyFileSync(bundledExample, envPath);
      console.log("[pkg] Created .env from bundled .env.example");
    }
  }
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
}

import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import donationRoutes from "./routes/donations";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);

// In production, serve built frontend static files.
//
// For normal node dist/app.js: __dirname = backend/dist, ../public = backend/public
// For pkg: assets are bundled via "public/**/*" in pkg.assets but the absolute
// virtual path inside the snapshot varies across pkg versions.  We probe
// multiple candidates at startup and fall back gracefully.

const publicDirCandidates: string[] = [
  path.join(__dirname, "../public"),         // dev mode: backend/dist/../public
  path.join(__dirname, "public"),             // pkg variant: next to dist/
  path.join("/snapshot", "public"),           // pkg: at snapshot root
  path.join("/snapshot", "backend", "public"),// pkg: with backend prefix
  path.join(process.cwd(), "public"),         // current working directory
];

// Environment variable override (highest priority)
const envStaticDir = process.env.STATIC_DIR;
if (envStaticDir) {
  publicDirCandidates.unshift(envStaticDir);
}

// Directory next to the pkg executable (user can place public/ beside the binary)
if ((process as any).pkg) {
  publicDirCandidates.push(path.join(path.dirname(process.execPath), "public"));
}

// Probe candidates; use the first one that contains index.html
let publicDir: string | undefined;
for (const candidate of publicDirCandidates) {
  try {
    if (fs.statSync(path.join(candidate, "index.html")).isFile()) {
      publicDir = candidate;
      break;
    }
  } catch {
    continue;
  }
}

if (publicDir) {
  console.log(`Serving static files from ${publicDir}`);
} else {
  // Fallback – pkg's snapshot may not expose files through statSync uniformly.
  // We still register the middleware; individual read attempts will fail
  // gracefully with 404.
  publicDir = publicDirCandidates[0];
  console.log(`Static files probe failed, using best guess: ${publicDir}`);
}

// Custom static file middleware (bypasses serve-static/send module which has
// bugs with send v1.2.1 async completion and dotfile handling for root path "/")
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/")) return next();

  const indexPath = path.join(publicDir, "index.html");

  // Determine the file to serve, preventing path traversal
  const reqPath = req.path === "/" ? "/index.html" : req.path;
  const safePath = path.join(publicDir, reqPath);

  // Security: ensure resolved path stays within publicDir
  if (!safePath.startsWith(path.resolve(publicDir))) return next();

  // Check if file exists and serve it via a read stream
  try {
    if (fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
      };
      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
      fs.createReadStream(safePath).pipe(res);
      return;
    }
  } catch {
    // File doesn't exist or can't be read, fall through
  }

  // SPA fallback: serve index.html for unmatched paths
  try {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    fs.createReadStream(indexPath).pipe(res);
  } catch {
    // Last resort: 404
    res.status(404).send("Not Found");
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
