import { USER_ROLES, canAccessAllCandidates, canViewCandidateForIntern, type UserRole } from "@/lib/permissions";

export type DemoUser = {
  id: string;
  name: string;
  role: UserRole;
  title: string;
};

export type CandidateEducationItem = {
  id: string;
  schoolName: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  isTopDegree: boolean;
};

export type CandidateWorkExperienceItem = {
  id: string;
  companyName: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CandidateFollowUpItem = {
  id: string;
  userId: string;
  type: string;
  content: string;
  nextAction?: string;
  nextFollowUpAt?: string;
  createdAt: string;
};

export type CandidateChangeLogItem = {
  id: string;
  actorUserId: string;
  actionType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
};

export type DemoCandidate = {
  id: string;
  name: string;
  phone: string;
  city: string;
  currentCompany: string;
  currentTitle: string;
  source: string;
  status: string;
  summary: string;
  currentFollowUserId: string | null;
  createdBy: string;
  lastFollowUpAt: string;
  tags: string[];
  educations: CandidateEducationItem[];
  workExperiences: CandidateWorkExperienceItem[];
  followUps: CandidateFollowUpItem[];
  changeLogs: CandidateChangeLogItem[];
};

export type DemoClient = {
  id: string;
  companyName: string;
  industry: string;
  city: string;
  cooperationStatus: string;
  priority: string;
  ownerUserId: string;
  notes: string;
};

export type DemoJob = {
  id: string;
  clientId: string;
  title: string;
  city: string;
  salaryRange: string;
  description: string;
  requirements: string;
  priority: string;
  status: string;
  deadline: string;
  ownerUserId: string;
};

export const demoUsers: DemoUser[] = [
  { id: "user-admin", name: "创始人", role: USER_ROLES.ADMIN, title: "管理员" },
  { id: "user-assistant-01", name: "王助理", role: USER_ROLES.ASSISTANT, title: "猎头助理" },
  { id: "user-intern-01", name: "小陈", role: USER_ROLES.INTERN, title: "实习生" },
];

export const demoCandidates: DemoCandidate[] = [
  {
    id: "candidate-zhanglin",
    name: "张琳",
    phone: "13800001111",
    city: "深圳",
    currentCompany: "某跨境电商平台",
    currentTitle: "高级产品经理",
    source: "Boss 直聘",
    status: "FOLLOWING",
    summary: "电商和增长方向经验较强，近 5 年一直在中大型互联网团队负责产品规划。",
    currentFollowUserId: "user-assistant-01",
    createdBy: "user-intern-01",
    lastFollowUpAt: "2026-05-08 20:30",
    tags: ["产品经理", "电商", "深圳", "可推荐"],
    educations: [
      {
        id: "edu-1",
        schoolName: "中山大学",
        degree: "本科",
        major: "信息管理与信息系统",
        startDate: "2013-09",
        endDate: "2017-06",
        isTopDegree: true,
      },
    ],
    workExperiences: [
      {
        id: "work-1",
        companyName: "某跨境电商平台",
        title: "高级产品经理",
        startDate: "2022-03",
        endDate: "至今",
        description: "负责用户增长与商家工具线，带领 4 人产品小组。",
      },
      {
        id: "work-2",
        companyName: "某本地生活平台",
        title: "产品经理",
        startDate: "2019-07",
        endDate: "2022-02",
        description: "负责商家中台和运营产品设计。",
      },
    ],
    followUps: [
      {
        id: "fu-1",
        userId: "user-intern-01",
        type: "获取简历",
        content: "在 Boss 上沟通后拿到 PDF 简历，候选人目前有开放机会。",
        createdAt: "2026-05-06 14:20",
      },
      {
        id: "fu-2",
        userId: "user-assistant-01",
        type: "电话沟通",
        content: "已电话确认求职动机，倾向深圳南山，期望薪资 35K-45K。",
        nextAction: "和 A 客户高级产品经理岗位比对",
        nextFollowUpAt: "2026-05-12 10:00",
        createdAt: "2026-05-08 20:30",
      },
    ],
    changeLogs: [
      {
        id: "cl-1",
        actorUserId: "user-intern-01",
        actionType: "CREATE_CANDIDATE",
        createdAt: "2026-05-06 14:25",
      },
      {
        id: "cl-2",
        actorUserId: "user-assistant-01",
        actionType: "UPDATE_FIELD",
        fieldName: "current_follow_user_id",
        oldValue: "",
        newValue: "王助理",
        createdAt: "2026-05-08 20:35",
      },
    ],
  },
  {
    id: "candidate-liwei",
    name: "李伟",
    phone: "13900002222",
    city: "上海",
    currentCompany: "某 AI 创业公司",
    currentTitle: "后端技术负责人",
    source: "微信推荐",
    status: "AVAILABLE",
    summary: "Java 和云原生背景，做过从 0 到 1 搭建技术团队，偏平台与中后台。",
    currentFollowUserId: "user-admin",
    createdBy: "user-assistant-01",
    lastFollowUpAt: "2026-05-09 11:00",
    tags: ["后端", "Java", "架构", "上海"],
    educations: [
      {
        id: "edu-2",
        schoolName: "华东理工大学",
        degree: "本科",
        major: "计算机科学与技术",
        startDate: "2010-09",
        endDate: "2014-06",
        isTopDegree: true,
      },
      {
        id: "edu-3",
        schoolName: "复旦大学",
        degree: "硕士",
        major: "软件工程",
        startDate: "2014-09",
        endDate: "2017-06",
        isTopDegree: false,
      },
    ],
    workExperiences: [
      {
        id: "work-3",
        companyName: "某 AI 创业公司",
        title: "后端技术负责人",
        startDate: "2021-05",
        endDate: "至今",
        description: "负责后端架构、数据平台和交付稳定性。",
      },
    ],
    followUps: [
      {
        id: "fu-3",
        userId: "user-admin",
        type: "微信沟通",
        content: "朋友推荐，已确认目前看机会，但只接受平台型职位。",
        nextAction: "筛选 CTO 直汇报岗位",
        createdAt: "2026-05-09 11:00",
      },
    ],
    changeLogs: [
      {
        id: "cl-3",
        actorUserId: "user-assistant-01",
        actionType: "CREATE_CANDIDATE",
        createdAt: "2026-05-07 09:15",
      },
    ],
  },
  {
    id: "candidate-zhaoqing",
    name: "赵晴",
    phone: "13700003333",
    city: "广州",
    currentCompany: "某消费品牌",
    currentTitle: "品牌营销经理",
    source: "Boss 直聘",
    status: "ON_HOLD",
    summary: "消费品牌和内容营销背景较好，但近期换工作的意愿还不稳定。",
    currentFollowUserId: "user-assistant-01",
    createdBy: "user-assistant-01",
    lastFollowUpAt: "2026-05-04 18:10",
    tags: ["市场", "品牌", "广州"],
    educations: [
      {
        id: "edu-4",
        schoolName: "暨南大学",
        degree: "本科",
        major: "广告学",
        startDate: "2012-09",
        endDate: "2016-06",
        isTopDegree: true,
      },
    ],
    workExperiences: [
      {
        id: "work-4",
        companyName: "某消费品牌",
        title: "品牌营销经理",
        startDate: "2020-08",
        endDate: "至今",
        description: "负责品牌 campaign 和达人合作策略。",
      },
    ],
    followUps: [
      {
        id: "fu-4",
        userId: "user-assistant-01",
        type: "待后续跟进",
        content: "候选人暂时不急，建议 6 月中旬再次联系。",
        nextFollowUpAt: "2026-06-15 15:00",
        createdAt: "2026-05-04 18:10",
      },
    ],
    changeLogs: [
      {
        id: "cl-4",
        actorUserId: "user-assistant-01",
        actionType: "UPDATE_FIELD",
        fieldName: "status",
        oldValue: "FOLLOWING",
        newValue: "ON_HOLD",
        createdAt: "2026-05-04 18:12",
      },
    ],
  },
];

export const demoClients: DemoClient[] = [
  {
    id: "client-a",
    companyName: "星链科技",
    industry: "企业服务",
    city: "深圳",
    cooperationStatus: "沟通中",
    priority: "HIGH",
    ownerUserId: "user-admin",
    notes: "创始团队回复较快，本周需要确认产品和研发两个岗位的优先级。",
  },
  {
    id: "client-b",
    companyName: "启明智能",
    industry: "AI",
    city: "上海",
    cooperationStatus: "已合作",
    priority: "URGENT",
    ownerUserId: "user-admin",
    notes: "技术团队扩张快，CTO 对候选人质量要求高，需要每周同步推荐进度。",
  },
  {
    id: "client-c",
    companyName: "云象消费",
    industry: "消费品牌",
    city: "广州",
    cooperationStatus: "待推进",
    priority: "MEDIUM",
    ownerUserId: "user-assistant-01",
    notes: "还在确认预算，先维护客户档案和联系人信息。",
  },
];

export const demoJobs: DemoJob[] = [
  {
    id: "job-1",
    clientId: "client-a",
    title: "高级产品经理",
    city: "深圳",
    salaryRange: "35K-45K",
    description: "负责企业服务产品规划和增长设计。",
    requirements: "5 年以上产品经验，有 SaaS 或中后台经验。",
    priority: "HIGH",
    status: "OPEN",
    deadline: "2026-05-20",
    ownerUserId: "user-admin",
  },
  {
    id: "job-2",
    clientId: "client-b",
    title: "后端技术负责人",
    city: "上海",
    salaryRange: "50K-70K",
    description: "负责后端架构升级和团队搭建。",
    requirements: "Java / 云原生 / 架构设计背景，带过 10 人以上团队优先。",
    priority: "URGENT",
    status: "OPEN",
    deadline: "2026-05-18",
    ownerUserId: "user-admin",
  },
  {
    id: "job-3",
    clientId: "client-c",
    title: "品牌营销经理",
    city: "广州",
    salaryRange: "25K-35K",
    description: "负责品牌 campaign 和达人合作。",
    requirements: "消费品牌经验，能独立负责整合营销项目。",
    priority: "MEDIUM",
    status: "PAUSED",
    deadline: "2026-06-10",
    ownerUserId: "user-assistant-01",
  },
];

type SearchParamsInput = Record<string, string | string[] | undefined>;

export function getUserById(userId: string) {
  return demoUsers.find((user) => user.id === userId);
}

export function resolveViewer(searchParams: SearchParamsInput) {
  const roleValue = getSingleValue(searchParams.role) ?? USER_ROLES.ADMIN;
  const userIdValue = getSingleValue(searchParams.userId) ?? "user-admin";
  const role = isUserRole(roleValue) ? roleValue : USER_ROLES.ADMIN;
  const user = getUserById(userIdValue) ?? demoUsers[0];

  if (user.role === role) {
    return user;
  }

  const matchedUser = demoUsers.find((item) => item.role === role) ?? demoUsers[0];
  return matchedUser;
}

export function getVisibleCandidates(viewer: DemoUser) {
  if (canAccessAllCandidates(viewer.role)) {
    return demoCandidates;
  }

  return demoCandidates.filter((candidate) =>
    canViewCandidateForIntern({
      role: viewer.role,
      userId: viewer.id,
      candidateCreatedBy: candidate.createdBy,
      currentFollowUserId: candidate.currentFollowUserId,
      followUpUserIds: candidate.followUps.map((followUp) => followUp.userId),
    }),
  );
}

export function getCandidateById(id: string) {
  return demoCandidates.find((candidate) => candidate.id === id);
}

export function getVisibleCandidateById(viewer: DemoUser, id: string) {
  return getVisibleCandidates(viewer).find((candidate) => candidate.id === id);
}

export function getVisibleClients(viewer: DemoUser) {
  if (viewer.role === USER_ROLES.INTERN) {
    return demoClients.filter((client) => client.ownerUserId === viewer.id);
  }

  return demoClients;
}

export function getClientById(id: string) {
  return demoClients.find((client) => client.id === id);
}

export function getVisibleClientById(viewer: DemoUser, id: string) {
  return getVisibleClients(viewer).find((client) => client.id === id);
}

export function getVisibleJobs(viewer: DemoUser) {
  if (viewer.role === USER_ROLES.INTERN) {
    return demoJobs.filter((job) => job.ownerUserId === viewer.id);
  }

  return demoJobs;
}

export function getClientJobs(clientId: string) {
  return demoJobs.filter((job) => job.clientId === clientId);
}

export function getClientName(clientId: string) {
  return getClientById(clientId)?.companyName ?? "未知客户";
}

export function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getDisplayName(userId: string | null | undefined) {
  if (!userId) {
    return "未分配";
  }

  return getUserById(userId)?.name ?? "未知成员";
}

export function getRoleLabel(role: UserRole) {
  if (role === USER_ROLES.ADMIN) {
    return "管理员";
  }

  if (role === USER_ROLES.ASSISTANT) {
    return "猎头助理";
  }

  return "实习生";
}

function isUserRole(value: string): value is UserRole {
  return Object.values(USER_ROLES).includes(value as UserRole);
}
