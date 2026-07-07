import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { getAsset } from "./generated/static-assets";

dotenv.config();

// 在 pkg 独立可执行文件中自动配置运行环境
function setupPkgEnvironment(): void {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
  if (!process.env.PORT) {
    process.env.PORT = "3001";
  }

  // DATABASE_URL must be an absolute path so Prisma can find the database
  // regardless of pkg snapshot path vs CWD.
  const dbPath = path.join(process.cwd(), "dev.db");
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${dbPath}`;
    console.log(`[pkg] DATABASE_URL set to ${process.env.DATABASE_URL}`);
  }

  // Extract embedded database (built by embed-assets.js)
  if (!fs.existsSync(dbPath)) {
    const dbAsset = getAsset("prisma/dev.db");
    if (dbAsset) {
      fs.writeFileSync(dbPath, dbAsset);
      console.log("[pkg] Created dev.db from embedded seed database");
    } else {
      console.log("[pkg] No embedded database found — will initialize fresh database if needed");
    }
  }
}
// In pkg, set a clean publicDir hint so the middleware security check doesn't
// trip over unresolved ".." in snapshot paths.
process.env.STATIC_DIR = process.env.STATIC_DIR || "";


/**
 * Seed the database with test users and projects matching prisma/seed.ts.
 * Used when the binary starts with an empty/fresh database.
 */
async function seedTestData(prisma: any): Promise<void> {
  const admin = await prisma.user.create({
    data: { name: "admin", phone: "13800000001", password: "123456", role: "admin" },
  });
  const org = await prisma.user.create({
    data: { name: "org", phone: "13800000002", password: "123456", role: "organization" },
  });
  const donor = await prisma.user.create({
    data: { name: "donor", phone: "13800000003", password: "123456", role: "donor" },
  });
  await prisma.user.create({
    data: { name: "匿名用户", phone: "anonymous", password: "nopass", role: "donor" },
  });

  const projects = [
    { title: "丽水山区困难学生助学计划", summary: "为丽水市青田县、景宁县等地200名山区困难学生提供学杂费补助和学习用品。", description: "丽水市是浙江省山区面积最大的地级市，部分偏远乡镇经济条件相对落后。本项目计划为200名品学兼优的困难学生提供每人500元的学杂费补助，同时配套发放学习用品包。", region: "丽水", category: "教育帮扶", targetAmount: 150000, raisedAmount: 120000, status: "fundraising", organizationId: org.id, startDate: new Date("2026-04-01"), endDate: new Date("2026-10-01") },
    { title: "衢州乡村老人医疗帮扶项目", summary: "为衢州市开化县、龙游县等地300名留守老人提供基础体检和健康知识普及服务。", description: "衢州农村地区留守老人比例高。本项目联合乡镇卫生院为300名老人提供每人200元的免费体检和健康管理服务，同时采购常用药品配发至村卫生室。", region: "衢州", category: "医疗救助", targetAmount: 200000, raisedAmount: 200000, status: "executing", organizationId: org.id, startDate: new Date("2026-03-15"), endDate: new Date("2026-09-15") },
    { title: "温州低收入家庭生活物资支持项目", summary: "为温州市文成县、泰顺县等地500户低收入家庭提供基本生活物资援助。", description: "文成县和泰顺县是浙江省山区26县中的重点帮扶区域。本项目计划为500户困难家庭配送基本生活物资包。", region: "温州", category: "困难家庭救助", targetAmount: 100000, raisedAmount: 35000, status: "fundraising", organizationId: org.id, startDate: new Date("2026-05-01"), endDate: new Date("2026-11-01") },
    { title: "杭州对口山区农产品产业扶持项目", summary: "帮助丽水、衢州等地农户发展特色农产品种植，提供技术培训、种苗补贴和销售渠道对接。", description: "依托杭州对口帮扶机制，本项目为200户农户提供高山蔬菜和中药材种植的技术培训和种苗补贴。同时搭建线上销售渠道。", region: "杭州", category: "产业扶持", targetAmount: 300000, raisedAmount: 300000, status: "completed", organizationId: org.id, startDate: new Date("2025-09-01"), endDate: new Date("2026-03-01") },
    { title: "舟山海岛困难儿童成长关爱项目", summary: "为舟山嵊泗、岱山等海岛地区的120名困境儿童提供心理辅导和暑期陪伴服务。", description: "舟山部分海岛交通不便，岛上留守儿童和困境儿童缺乏课外活动和情感陪伴。本项目招募志愿者团队，分批次上岛开展暑期夏令营活动。", region: "舟山", category: "教育帮扶", targetAmount: 80000, raisedAmount: 50000, status: "fundraising", organizationId: org.id, startDate: new Date("2026-06-01"), endDate: new Date("2026-12-01") },
    { title: "金华农村残障人士康复支持项目", summary: "为金华市磐安县、武义县等地150名农村残障人士提供康复器材适配和居家康复指导服务。", description: "农村残障人士获取康复资源相对困难，本项目委托专业康复机构为150名残障人士进行一对一评估，按需配备基础康复器材。", region: "金华", category: "医疗救助", targetAmount: 180000, raisedAmount: 180000, status: "completed", organizationId: org.id, startDate: new Date("2025-06-01"), endDate: new Date("2026-02-01") },
    { title: "绍兴山区困难群众春节慰问项目", summary: "为绍兴市新昌县、嵊州市等地300户困难家庭发放春节慰问金和年货礼包。", description: "本项目为300户低保、特困和残疾人家庭每户发放300元慰问金和价值200元的年货礼包。", region: "绍兴", category: "困难家庭救助", targetAmount: 150000, raisedAmount: 0, status: "pending", organizationId: org.id, startDate: new Date("2026-12-01"), endDate: new Date("2027-01-31") },
  ];

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }

  const projectRecords = await prisma.project.findMany();

  for (const d of [
    { userId: donor.id, projectId: projectRecords[0].id, amount: 200, isAnonymous: false, message: "加油！" },
    { userId: donor.id, projectId: projectRecords[0].id, amount: 100, isAnonymous: true, message: null },
    { userId: donor.id, projectId: projectRecords[1].id, amount: 500, isAnonymous: false, message: "祝老人们健康长寿" },
    { userId: donor.id, projectId: projectRecords[2].id, amount: 100, isAnonymous: false, message: "一点心意" },
    { userId: donor.id, projectId: projectRecords[4].id, amount: 300, isAnonymous: false, message: "孩子们加油" },
  ]) {
    await prisma.donation.create({
      data: { ...d, createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) },
    });
  }

  for (const project of projectRecords) {
    if (project.status === "pending") continue;
    const flows = [
      { title: "用户捐赠募集", amount: project.raisedAmount * 0.6, type: "received", description: "社会公众通过平台进行捐赠", status: "approved" },
      { title: "平台审核确认", amount: project.raisedAmount * 0.6, type: "verified", description: "平台对募集资金进行审核确认", status: "approved" },
      { title: "资金拨付至执行组织", amount: project.raisedAmount * 0.5, type: "allocated", description: "首笔资金已拨付至公益组织账户", status: "approved" },
      { title: "项目执行使用", amount: project.raisedAmount * 0.3, type: "used", description: "物资采购和发放工作完成", status: project.status === "completed" || project.status === "executing" ? "approved" : "pending" },
      { title: "项目完成尾款拨付", amount: project.raisedAmount * 0.2, type: "allocated", description: "项目验收后尾款拨付", status: project.status === "completed" ? "approved" : "pending" },
    ];
    for (let i = 0; i < flows.length; i++) {
      await prisma.fundFlow.create({
        data: { ...flows[i], projectId: project.id, createdAt: new Date(Date.now() - (flows.length - i) * 7 * 24 * 60 * 60 * 1000) },
      });
    }
  }
}

if ((process as any).pkg) {
  setupPkgEnvironment();
}


import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import donationRoutes from "./routes/donations";
import adminRoutes from "./routes/admin";
import prisma from "./db";

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

// Probe candidates; use the first one that contains index.html
let publicDir: string | undefined;

if ((process as any).pkg) {
  // In pkg mode, fs.statSync can't probe snapshot paths. Use the embedded
  // asset system instead, which is also safer and avoids snapshot ENOENT.
  if (getAsset("index.html")) {
    publicDir = "";
    console.log("Serving static files from embedded assets (pkg mode)");
  } else {
    // Fall back to filesystem probes for CWD / execdir placement
    for (const candidate of publicDirCandidates) {
      try {
        if (fs.statSync(path.join(candidate, "index.html")).isFile()) {
          publicDir = path.resolve(candidate);
          break;
        }
      } catch {
        continue;
      }
    }
  }
} else {
  // Normal node mode: probe from filesystem
  for (const candidate of publicDirCandidates) {
    try {
      if (fs.statSync(path.join(candidate, "index.html")).isFile()) {
        publicDir = path.resolve(candidate);
        break;
      }
    } catch {
      continue;
    }
  }
  // Also try env STATIC_DIR and next-to-execdir
  const extras: string[] = [process.env.STATIC_DIR, path.join(path.dirname(process.execPath), "public")].filter(Boolean) as string[];
  for (const extra of extras) {
    try {
      if (fs.statSync(path.join(extra, "index.html")).isFile()) {
        publicDir = path.resolve(extra);
        break;
      }
    } catch {
    }
  }
}

if (publicDir) {
  console.log(`Serving static files from ${publicDir}`);
} else {
  // Use empty string so getAsset() lookups work cleanly (key = reqPath directly).
  publicDir = "";
  console.log(`Static files probe failed, using embedded assets`);
}

// Normalize publicDir so the security check works consistently
const resolvedPublicDir = publicDir ? path.resolve(publicDir) : "";
// Custom static file middleware (bypasses serve-static/send module which has
// bugs with send v1.2.1 async completion and dotfile handling for root path "/")
const MIME_MAP: Record<string, string> = {
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

// Custom static file middleware
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/")) return next();

  const reqPath = req.path === "/" ? "/index.html" : req.path;

  // 1. Try embedded assets first (safe in pkg mode, avoids fs crashes)
  //    When resolvedPublicDir is empty (pkg mode), assetRelPath = reqPath directly.
  const assetRelPath = resolvedPublicDir
    ? path.relative(resolvedPublicDir, path.join(resolvedPublicDir, reqPath))
    : reqPath.replace(/^\//, "");
  const fileAsset = getAsset(assetRelPath);
  if (fileAsset) {
    const ext = path.extname(assetRelPath).toLowerCase();
    res.setHeader("Content-Type", MIME_MAP[ext] || "application/octet-stream");
    res.end(fileAsset);
    return;
  }

  // 2. SPA fallback: serve index.html for unmatched paths
  const indexAsset = getAsset("index.html");
  if (indexAsset) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(indexAsset);
    return;
  }

  // 3. Try filesystem (dev mode / non-pkg; in pkg snapshot stat/read will fail)
  const safePath = path.join(publicDir!, reqPath);
  if (resolvedPublicDir) {
    // Security: ensure resolved path stays within publicDir
    if (!path.resolve(safePath).startsWith(resolvedPublicDir)) {
      return next();
    }
  }
  try {
    if (fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader("Content-Type", MIME_MAP[ext] || "application/octet-stream");
      const content = fs.readFileSync(safePath);
      res.end(content);
      return;
    }
  } catch {
    // Not accessible via filesystem, continue
  }

  // 4. Last resort
  res.status(404).send("Not Found");
});


async function startServer(): Promise<void> {
  // Initialize database if needed
  try {
    await prisma.$connect();

    // Check if the database is initialized (has at least the User table)
    let initialized = false;
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      initialized = userCount > 0;
    } catch {
      // Table doesn't exist or DB not initialized
    }

    if (!initialized) {
      console.log("[startup] Database is empty or uninitialized - attempting to initialize...");

      // Try to create tables from embedded schema.sql
      const schemaAsset = getAsset("prisma/schema.sql");
      if (schemaAsset) {
        const schema = schemaAsset.toString("utf-8");
        const statements = schema
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith("--"));

        let stmtCount = 0;
        for (const stmt of statements) {
          try {
            await prisma.$executeRawUnsafe(stmt + ";");
            stmtCount++;
          } catch (err) {
            console.warn("[startup] Skipping statement (may already exist):", (stmt as string).slice(0, 60) + "...");
          }
        }
        console.log(`[startup] Executed ${stmtCount} schema statements`);
      } else {
        console.log("[startup] No embedded schema.sql found - tables may be missing");
      }

      // Seed test data
      await seedTestData(prisma);
      console.log("[startup] Test data seeded successfully");
    } else {
      console.log(`[startup] Database already initialized (${userCount} users found)`);
    }
  } catch (err) {
    console.error("[startup] Database initialization error:", err);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
