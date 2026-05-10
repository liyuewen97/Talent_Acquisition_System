import { PrismaClient, UserRoleCode, UserStatus, CandidateStatus, FollowUpType, PriorityLevel, JobStatus } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Roles
  const roles = [
    { code: UserRoleCode.ADMIN, name: '管理员' },
    { code: UserRoleCode.ASSISTANT, name: '猎头助理' },
    { code: UserRoleCode.INTERN, name: '实习生' },
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
    { id: '00000000-0000-0000-0000-000000000001', name: '创始人', email: 'admin@example.com', roleId: roleMap[UserRoleCode.ADMIN], passwordHash: 'hash', status: UserStatus.ACTIVE },
    { id: '00000000-0000-0000-0000-000000000002', name: '王助理', email: 'assistant@example.com', roleId: roleMap[UserRoleCode.ASSISTANT], passwordHash: 'hash', status: UserStatus.ACTIVE },
    { id: '00000000-0000-0000-0000-000000000003', name: '小陈', email: 'intern@example.com', roleId: roleMap[UserRoleCode.INTERN], passwordHash: 'hash', status: UserStatus.ACTIVE },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  const dbUsers = await prisma.user.findMany();
  const adminId = dbUsers.find(u => u.name === '创始人')?.id!;
  const assistantId = dbUsers.find(u => u.name === '王助理')?.id!;
  const internId = dbUsers.find(u => u.name === '小陈')?.id!;

  // 3. Create Tags
  const tags = [
    { name: '产品经理', color: 'blue', createdBy: adminId },
    { name: '电商', color: 'green', createdBy: adminId },
    { name: '深圳', color: 'orange', createdBy: adminId },
    { name: '可推荐', color: 'red', createdBy: adminId },
    { name: '后端', color: 'purple', createdBy: adminId },
    { name: 'Java', color: 'blue', createdBy: adminId },
    { name: '架构', color: 'indigo', createdBy: adminId },
    { name: '上海', color: 'cyan', createdBy: adminId },
    { name: '市场', color: 'pink', createdBy: adminId },
    { name: '品牌', color: 'rose', createdBy: adminId },
    { name: '广州', color: 'teal', createdBy: adminId },
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

  // 4. Create Candidates
  const candidates = [
    {
      name: '张琳',
      phone: '13800001111',
      city: '深圳',
      currentCompany: '某跨境电商平台',
      currentTitle: '高级产品经理',
      source: 'Boss 直聘',
      status: CandidateStatus.FOLLOWING,
      summary: '电商和增长方向经验较强，近 5 年一直在中大型互联网团队负责产品规划。',
      currentFollowUserId: assistantId,
      createdBy: internId,
      lastFollowUpAt: new Date('2026-05-08T20:30:00'),
    },
    {
      name: '李伟',
      phone: '13900002222',
      city: '上海',
      currentCompany: '某 AI 创业公司',
      currentTitle: '后端技术负责人',
      source: '微信推荐',
      status: CandidateStatus.AVAILABLE,
      summary: 'Java 和云原生背景，做过从 0 到 1 搭建技术团队，偏平台与中后台。',
      currentFollowUserId: adminId,
      createdBy: assistantId,
      lastFollowUpAt: new Date('2026-05-09T11:00:00'),
    },
    {
      name: '赵晴',
      phone: '13700003333',
      city: '广州',
      currentCompany: '某消费品牌',
      currentTitle: '品牌营销经理',
      source: 'Boss 直聘',
      status: CandidateStatus.ON_HOLD,
      summary: '消费品牌和内容营销背景较好，但近期换工作的意愿还不稳定。',
      currentFollowUserId: assistantId,
      createdBy: assistantId,
      lastFollowUpAt: new Date('2026-05-04T18:10:00'),
    },
  ];

  for (const c of candidates) {
    const createdCandidate = await prisma.candidate.create({
      data: {
        ...c,
        educations: {
          create: c.name === '张琳' ? [
            { schoolName: '中山大学', degree: '本科', major: '信息管理与信息系统', startDate: new Date('2013-09-01'), endDate: new Date('2017-06-01'), isTopDegree: true }
          ] : c.name === '李伟' ? [
            { schoolName: '华东理工大学', degree: '本科', major: '计算机科学与技术', startDate: new Date('2010-09-01'), endDate: new Date('2014-06-01'), isTopDegree: true },
            { schoolName: '复旦大学', degree: '硕士', major: '软件工程', startDate: new Date('2014-09-01'), endDate: new Date('2017-06-01'), isTopDegree: false }
          ] : [
            { schoolName: '暨南大学', degree: '本科', major: '广告学', startDate: new Date('2012-09-01'), endDate: new Date('2016-06-01'), isTopDegree: true }
          ]
        },
        workExperiences: {
          create: c.name === '张琳' ? [
            { companyName: '某跨境电商平台', title: '高级产品经理', startDate: new Date('2022-03-01'), description: '负责用户增长与商家工具线，带领 4 人产品小组。' },
            { companyName: '某本地生活平台', title: '产品经理', startDate: new Date('2019-07-01'), endDate: new Date('2022-02-01'), description: '负责商家中台和运营产品设计。' }
          ] : c.name === '李伟' ? [
            { companyName: '某 AI 创业公司', title: '后端技术负责人', startDate: new Date('2021-05-01'), description: '负责后端架构、数据平台和交付稳定性。' }
          ] : [
            { companyName: '某消费品牌', title: '品牌营销经理', startDate: new Date('2020-08-01'), description: '负责品牌 campaign 和达人合作策略。' }
          ]
        },
        tags: {
          create: (c.name === '张琳' ? ['产品经理', '电商', '深圳', '可推荐'] :
                   c.name === '李伟' ? ['后端', 'Java', '架构', '上海'] :
                   ['市场', '品牌', '广州']).map(tagName => ({
                     tag: { connect: { id: tagMap[tagName] } }
                   }))
        },
        followUps: {
          create: c.name === '张琳' ? [
            { followUpUserId: internId, followUpType: FollowUpType.RESUME_RECEIVED, content: '在 Boss 上沟通后拿到 PDF 简历，候选人目前有开放机会。', createdAt: new Date('2026-05-06T14:20:00') },
            { followUpUserId: assistantId, followUpType: FollowUpType.PHONE_CALL, content: '已电话确认求职动机，倾向深圳南山，期望薪资 35K-45K。', nextAction: '和 A 客户高级产品经理岗位比对', nextFollowUpAt: new Date('2026-05-12T10:00:00'), createdAt: new Date('2026-05-08T20:30:00') }
          ] : c.name === '李伟' ? [
            { followUpUserId: adminId, followUpType: FollowUpType.WECHAT, content: '朋友推荐，已确认目前 look for opportunities，但只接受平台型职位。', nextAction: '筛选 CTO 直汇报岗位', createdAt: new Date('2026-05-09T11:00:00') }
          ] : [
            { followUpUserId: assistantId, followUpType: FollowUpType.FOLLOW_LATER, content: '候选人暂时不急，建议 6 月中旬再次联系。', nextFollowUpAt: new Date('2026-06-15T15:00:00'), createdAt: new Date('2026-05-04T18:10:00') }
          ]
        }
      }
    });
  }

  // 5. Create Clients & Jobs
  const clients = [
    { companyName: '星链科技', industry: '企业服务', city: '深圳', cooperationStatus: '沟通中', priority: PriorityLevel.HIGH, ownerUserId: adminId, notes: '创始团队回复较快，本周需要确认产品和研发两个岗位的优先级。' },
    { companyName: '启明智能', industry: 'AI', city: '上海', cooperationStatus: '已合作', priority: PriorityLevel.URGENT, ownerUserId: adminId, notes: '技术团队扩张快，CTO 对候选人质量要求高，需要每周同步推荐进度。' },
    { companyName: '云象消费', industry: '消费品牌', city: '广州', cooperationStatus: '待推进', priority: PriorityLevel.MEDIUM, ownerUserId: assistantId, notes: '还在确认预算，先维护客户档案和联系人信息。' },
  ];

  for (const client of clients) {
    const createdClient = await prisma.client.create({
      data: {
        ...client,
        jobs: {
          create: client.companyName === '星链科技' ? [
            { title: '高级产品经理', city: '深圳', salaryRange: '35K-45K', description: '负责企业服务产品规划和增长设计。', requirements: '5 年以上产品经验，有 SaaS 或中后台经验。', priority: PriorityLevel.HIGH, status: JobStatus.OPEN, deadline: new Date('2026-05-20'), ownerUserId: adminId }
          ] : client.companyName === '启明智能' ? [
            { title: '后端技术负责人', city: '上海', salaryRange: '50K-70K', description: '负责后端架构升级和团队搭建。', requirements: 'Java / 云原生 / 架构设计背景，带过 10 人以上团队优先。', priority: PriorityLevel.URGENT, status: JobStatus.OPEN, deadline: new Date('2026-05-18'), ownerUserId: adminId }
          ] : [
            { title: '品牌营销经理', city: '广州', salaryRange: '25K-35K', description: '负责品牌 campaign 和达人合作。', requirements: '消费品牌经验，能独立负责整合营销项目。', priority: PriorityLevel.MEDIUM, status: JobStatus.PAUSED, deadline: new Date('2026-06-10'), ownerUserId: assistantId }
          ]
        }
      }
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
