import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/admin/statistics
router.get("/statistics", async (_req: Request, res: Response) => {
  try {
    const totalDonations = await prisma.donation.aggregate({ _sum: { amount: true } });
    const totalProjects = await prisma.project.count();
    const totalDonors = (await prisma.donation.findMany({ select: { userId: true }, distinct: ["userId"] })).length;
    const regions = await prisma.project.groupBy({ by: ["region"], _count: { id: true } });

    const categoryStats = await prisma.project.groupBy({
      by: ["category"],
      _sum: { targetAmount: true, raisedAmount: true },
      _count: { id: true },
    });

    const recentDonations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } }, project: { select: { title: true } } },
    });

    const pendingAudits = await prisma.project.count({ where: { status: "pending" } });
    const pendingFeedbacks = await prisma.feedback.count({ where: { status: "pending" } });

    res.json({
      totalAmount: totalDonations._sum.amount || 0,
      totalProjects,
      totalDonors,
      regions,
      categoryStats,
      recentDonations,
      pendingAudits,
      pendingFeedbacks,
    });
  } catch (error) {
    res.status(500).json({ message: "获取统计失败", error });
  }
});

// GET /api/admin/projects
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const { status, page = "1", pageSize = "20" } = req.query;
    const where: any = {};
    if (status) where.status = status;

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
    res.status(500).json({ message: "获取项目管理列表失败", error });
  }
});

// PATCH /api/admin/projects/:id/status
router.patch("/projects/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status },
    });
    await prisma.auditLog.create({
      data: { action: "STATUS_CHANGE", detail: `项目状态变更为 ${status}`, projectId: project.id },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "更新项目状态失败", error });
  }
});

// GET /api/admin/donations
router.get("/donations", async (req: Request, res: Response) => {
  try {
    const { page = "1", pageSize = "20" } = req.query;
    const total = await prisma.donation.count();
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      take: parseInt(pageSize as string),
      include: { user: { select: { name: true } }, project: { select: { title: true } } },
    });
    res.json({ data: donations, total, page: parseInt(page as string), pageSize: parseInt(pageSize as string) });
  } catch (error) {
    res.status(500).json({ message: "获取捐赠记录失败", error });
  }
});

// GET /api/admin/funds
router.get("/funds", async (req: Request, res: Response) => {
  try {
    const flows = await prisma.fundFlow.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { title: true } } },
    });
    res.json(flows);
  } catch (error) {
    res.status(500).json({ message: "获取资金流向失败", error });
  }
});

// GET /api/admin/feedbacks
router.get("/feedbacks", async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { title: true } } },
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "获取反馈列表失败", error });
  }
});

// PATCH /api/admin/feedbacks/:id/status
router.patch("/feedbacks/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const feedback = await prisma.feedback.update({
      where: { id: parseInt(req.params.id as string) },
      data: { status },
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "更新反馈状态失败", error });
  }
});

// GET /api/admin/statistics/trends
router.get("/statistics/trends", async (_req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "asc" },
      select: { amount: true, createdAt: true },
    });

    // Group by date
    const trends: Record<string, number> = {};
    donations.forEach((d) => {
      const date = d.createdAt.toISOString().split("T")[0];
      trends[date] = (trends[date] || 0) + d.amount;
    });

    res.json(Object.entries(trends).map(([date, amount]) => ({ date, amount })));
  } catch (error) {
    res.status(500).json({ message: "获取趋势数据失败", error });
  }
});

// GET /api/admin/audit-logs
router.get("/audit-logs", async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { project: { select: { title: true } } },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "获取审计日志失败", error });
  }
});

export default router;
