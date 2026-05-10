const { PrismaClient, UserRoleCode, UserStatus, CandidateStatus, FollowUpType, PriorityLevel, JobStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Create Roles
  const roles = [
    { code: 'ADMIN', name: '管理员' },
    { code: 'ASSISTANT', name: '猎头助理' },
    { code: 'INTERN', name: '实习生' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }

  const dbRoles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(dbRoles.map(r => [r.code, r.id]));

  // 2. Create Users
  const users = [
    { id: '00000000-0000-0000-0000-000000000001', name: '创始人', email: 'admin@example.com', roleId: roleMap['ADMIN'], passwordHash: 'hash', status: 'ACTIVE' },
    { id: '00000000-0000-0000-0000-000000000002', name: '王助理', email: 'assistant@example.com', roleId: roleMap['ASSISTANT'], passwordHash: 'hash', status: 'ACTIVE' },
    { id: '00000000-0000-0000-0000-000000000003', name: '小陈', email: 'intern@example.com', roleId: roleMap['INTERN'], passwordHash: 'hash', status: 'ACTIVE' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  const dbUsers = await prisma.user.findMany();
  const adminId = dbUsers.find(u => u.name === '创始人').id;
  const assistantId = dbUsers.find(u => u.name === '王助理').id;
  const internId = dbUsers.find(u => u.name === '小陈').id;

  // 3. Create Tags
  const tags = [
    { name: '产品经理', color: 'blue', createdBy: adminId },
    { name: '电商', color: 'green', createdBy: adminId },
    { name: '深圳', color: 'orange', createdBy: adminId },
    { name: '可推荐', color: 'red', createdBy: adminId },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  const dbTags = await prisma.tag.findMany();
  const tagMap = Object.fromEntries(dbTags.map(t => [t.name, t.id]));

  // 4. Create Candidate
  const candidate = await prisma.candidate.create({
    data: {
      name: '张琳',
      phone: '13800001111',
      city: '深圳',
      currentCompany: '某跨境电商平台',
      currentTitle: '高级产品经理',
      source: 'Boss 直聘',
      status: 'FOLLOWING',
      summary: '电商和增长方向经验较强。',
      currentFollowUserId: assistantId,
      createdBy: internId,
      lastFollowUpAt: new Date('2026-05-08T20:30:00'),
      educations: {
        create: [
          { schoolName: '中山大学', degree: '本科', major: '信息管理', startDate: new Date('2013-09-01'), endDate: new Date('2017-06-01'), isTopDegree: true }
        ]
      },
      tags: {
        create: [{ tag: { connect: { id: tagMap['产品经理'] } } }]
      }
    }
  });

  console.log('Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
