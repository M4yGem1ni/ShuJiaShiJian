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

// In production, serve built frontend static files
// pkg (standalone executable) stores assets relative to the executable path
const publicDir = (process as any).pkg
  ? path.join(path.dirname(process.execPath), "public")
  : path.join(__dirname, "../public");

const indexPath = path.join(publicDir, "index.html");
if (fs.existsSync(indexPath)) {
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir, { dotfiles: "allow" }));

  // SPA fallback: serve index.html for all non-API, non-static GET requests
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/")) {
      res.sendFile(indexPath, (err) => {
        if (err) next();
      });
    } else {
      next();
    }
  });
} else {
  console.log(`Static files not found at ${publicDir}, skipping (dev mode ok)`);
}


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
