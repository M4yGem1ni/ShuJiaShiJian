import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const { region, category, status, search, page = "1", pageSize = "10" } = req.query;
    const where: any = {};
    if (region) where.region = region;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) where.title = { contains: search as string };

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      take: parseInt(pageSize as string),
      include: { organization: { select: { id: true, name: true } } },
    });

    res.json({ data: projects, total, page: parseInt(page as string), pageSize: parseInt(pageSize as string) });
  } catch (error) {
    res.status(500).json({ message: "获取项目列表失败", error });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        organization: { select: { id: true, name: true } },
        fundFlows: { orderBy: { createdAt: "asc" } },
        feedbacks: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) return res.status(404).json({ message: "项目不存在" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "获取项目详情失败", error });
  }
});

// GET /api/projects/:id/fund-flows
router.get("/:id/fund-flows", async (req: Request, res: Response) => {
  try {
    const flows = await prisma.fundFlow.findMany({
      where: { projectId: parseInt(req.params.id) },
      orderBy: { createdAt: "asc" },
    });
    res.json(flows);
  } catch (error) {
    res.status(500).json({ message: "获取资金流向失败", error });
  }
});

// GET /api/projects/:id/feedbacks
router.get("/:id/feedbacks", async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { projectId: parseInt(req.params.id) },
      orderBy: { createdAt: "desc" },
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "获取反馈失败", error });
  }
});

export default router;
