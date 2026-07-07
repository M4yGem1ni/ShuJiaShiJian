import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// POST /api/donations
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, projectId, amount, isAnonymous, message } = req.body;
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: "项目不存在" });

    const donation = await prisma.donation.create({
      data: { userId, projectId, amount, isAnonymous, message: message || null },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { raisedAmount: { increment: amount } },
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "捐赠失败", error });
  }
});

// GET /api/donations/user/:userId
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: parseInt(req.params.userId as string) },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, title: true, region: true, category: true } } },
    });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "获取捐赠记录失败", error });
  }
});

export default router;
