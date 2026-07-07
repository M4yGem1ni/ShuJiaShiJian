import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.fundFlow.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

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

  for (const project of projectRecords) {
    if (project.status === "completed" || project.status === "executing" || project.status === "fundraising") {
      await prisma.feedback.create({
        data: { title: "项目启动与方案确认", content: `经过前期调研和方案设计，${project.title}项目已正式启动。`, usedAmount: project.raisedAmount * 0.1, status: "approved", projectId: project.id, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      });
    }
    if (project.status === "completed" || project.status === "executing") {
      await prisma.feedback.create({
        data: { title: "首批物资发放完成", content: `第一批帮扶物资已顺利完成发放。`, usedAmount: project.raisedAmount * 0.4, status: "approved", projectId: project.id, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
    }
    if (project.status === "completed") {
      await prisma.feedback.create({
        data: { title: "项目总结与效果评估", content: `${project.title}项目已全部完成。`, usedAmount: project.raisedAmount, status: "approved", projectId: project.id, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });
    }
    if (project.status === "fundraising") {
      await prisma.feedback.create({
        data: { title: "中期进展报告（待审核）", content: "项目执行中期，已完成第二批物资采购，正在进行发放准备工作。", usedAmount: project.raisedAmount * 0.3, status: "pending", projectId: project.id, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      });
    }
  }

  for (const project of projectRecords) {
    if (project.status !== "pending") {
      await prisma.auditLog.create({
        data: { action: "PROJECT_APPROVED", detail: `项目「${project.title}」已通过审核`, projectId: project.id },
      });
    }
  }

  console.log("Seed data created successfully!");
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`Projects: ${await prisma.project.count()}`);
  console.log(`Donations: ${await prisma.donation.count()}`);
  console.log(`FundFlows: ${await prisma.fundFlow.count()}`);
  console.log(`Feedbacks: ${await prisma.feedback.count()}`);
  console.log(`AuditLogs: ${await prisma.auditLog.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
