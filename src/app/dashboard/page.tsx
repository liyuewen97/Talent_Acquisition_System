import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canAccessAllCandidates } from "@/lib/permissions";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  
  const roleValue = (Array.isArray(resolvedSearchParams.role) ? resolvedSearchParams.role[0] : resolvedSearchParams.role) || "ADMIN";
  const userIdValue = (Array.isArray(resolvedSearchParams.userId) ? resolvedSearchParams.userId[0] : resolvedSearchParams.userId);
  
  const isUuid = userIdValue && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdValue);

  const viewer = await prisma.user.findFirst({
    where: isUuid ? { id: userIdValue } : { role: { code: roleValue as UserRoleCode } },
    include: { role: true }
  }) || await prisma.user.findFirst({ include: { role: true } });

  if (!viewer) {
    return <div>请先初始化数据库用户。</div>;
  }

  // Fetch Candidates based on permissions
  const candidateWhere: any = {};
  if (!canAccessAllCandidates(viewer.role.code as any)) {
    candidateWhere.OR = [
      { createdBy: viewer.id },
      { currentFollowUserId: viewer.id },
      { followUps: { some: { followUpUserId: viewer.id } } }
    ];
  }

  const candidates = await prisma.candidate.findMany({
    where: candidateWhere,
    include: {
      followUps: { include: { followUpUser: true } },
      currentFollowUser: true,
    }
  });

  const clients = await prisma.client.findMany({
    where: viewer.role.code === "INTERN" ? { ownerUserId: viewer.id } : {},
  });

  const jobs = await prisma.job.findMany({
    where: viewer.role.code === "INTERN" ? { ownerUserId: viewer.id } : {},
    include: { client: true, owner: true }
  });

  const recentFollowUps = candidates
    .flatMap((candidate) =>
      candidate.followUps.map((followUp) => ({
        id: followUp.id,
        candidateName: candidate.name,
        type: followUp.followUpType,
        content: followUp.content,
        userName: followUp.followUpUser.name,
        createdAt: followUp.createdAt,
      })),
    )
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 5);

  const staleCandidates = candidates
    .filter((candidate) => candidate.status === "FOLLOWING" || candidate.status === "ON_HOLD")
    .slice(0, 4);

  const highPriorityJobs = jobs
    .filter((job) => job.priority === "HIGH" || job.priority === "URGENT")
    .slice(0, 4);

  const allUsers = await prisma.user.findMany({
    where: { role: { code: { not: "INTERN" } } },
    include: { role: true }
  });

  const teamStats = allUsers.map((user) => ({
    user,
    candidateCount: candidates.filter((candidate) => candidate.currentFollowUserId === user.id).length,
    followUpCount: candidates.flatMap((candidate) => candidate.followUps).filter((item) => item.followUpUserId === user.id).length,
  }));

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Dashboard</p>
          <h1>管理看板</h1>
          <p className="muted">
            当前查看人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={`/candidates/upload?role=${viewer.role.code}&userId=${viewer.id}`}>
            简历解析入库
          </Link>
          <Link className="button-secondary" href={`/candidates?role=${viewer.role.code}&userId=${viewer.id}`}>
            候选人库
          </Link>
          <Link className="button-secondary" href={`/tags?role=${viewer.role.code}&userId=${viewer.id}`}>
            标签管理
          </Link>
          <Link className="button-secondary" href={`/clients?role=${viewer.role.code}&userId=${viewer.id}`}>
            客户管理
          </Link>
          <Link className="button-primary" href={`/jobs?role=${viewer.role.code}&userId=${viewer.id}`}>
            岗位管理
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p>当前可见候选人</p>
          <strong>{candidates.length}</strong>
        </article>
        <article className="stat-card">
          <p>当前可见客户</p>
          <strong>{clients.length}</strong>
        </article>
        <article className="stat-card">
          <p>开放岗位数</p>
          <strong>{jobs.filter((job) => job.status === "OPEN").length}</strong>
        </article>
        <article className="stat-card">
          <p>高优先级岗位</p>
          <strong>{highPriorityJobs.length}</strong>
        </article>
      </section>

      <section className="panel-grid">
        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>最近跟进动态</h2>
              <p className="muted">帮助你快速判断本周团队在推进什么候选人。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {recentFollowUps.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <h3>
                    {item.candidateName} | {item.type}
                  </h3>
                  <p className="muted">
                    {item.createdAt.toLocaleString()} | {item.userName}
                  </p>
                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>本周重点岗位</h2>
              <p className="muted">优先处理高优先级和临近截止时间的岗位。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {highPriorityJobs.map((job) => (
                <div className="timeline-item" key={job.id}>
                  <h3>
                    {job.title} | {job.client.companyName}
                  </h3>
                  <p className="muted">
                    {job.city} | {job.salaryRange} | 截止 {job.deadline?.toLocaleDateString() || "未设置"}
                  </p>
                  <p>
                    优先级 {job.priority} | 负责人 {job.owner.name}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>待跟进候选人</h2>
              <p className="muted">这里展示需要关注的活跃候选人。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {staleCandidates.map((candidate) => (
                <div className="timeline-item" key={candidate.id}>
                  <h3>{candidate.name}</h3>
                  <p className="muted">
                    {candidate.currentTitle} | {candidate.currentCompany}
                  </p>
                  <p>最近跟进：{candidate.lastFollowUpAt?.toLocaleString() || "无"}</p>
                  <p>当前跟进人：{candidate.currentFollowUser?.name || "未分配"}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>团队执行概览</h2>
              <p className="muted">各成员当前维护的人才池和跟进量。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {teamStats.map((item) => (
                <div className="timeline-item" key={item.user.id}>
                  <h3>{item.user.name}</h3>
                  <p className="muted">{item.user.role.name}</p>
                  <p>当前跟进候选人：{item.candidateCount}</p>
                  <p>累计跟进记录：{item.followUpCount}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
