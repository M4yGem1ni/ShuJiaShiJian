import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

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
const publicDir = path.join(__dirname, "../public");
if (process.env.NODE_ENV === "production" && fs.existsSync(publicDir)) {
  console.log(`Serving static files from ${publicDir}`);
  app.use(express.static(publicDir));

  // SPA fallback: serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });
} else {
  console.log("Development mode: static files not served by backend");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
