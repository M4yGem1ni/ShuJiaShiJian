import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.findFirst({ where: { name: phone } });
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "手机号或密码错误" });
    }
    const { password: _, ...userInfo } = user;
    res.json({ user: userInfo, token: `demo-token-${user.id}` });
  } catch (error) {
    res.status(500).json({ message: "登录失败", error });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  const userId = parseInt(req.headers["x-user-id"] as string);
  if (!userId) return res.status(401).json({ message: "未登录" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "用户不存在" });
  const { password: _, ...userInfo } = user;
  res.json(userInfo);
});

export default router;
