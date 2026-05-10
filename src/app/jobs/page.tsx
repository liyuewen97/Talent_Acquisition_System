import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
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

  const where: any = {};
  if (viewer.role.code === "INTERN") {
    where.ownerUserId = viewer.id;
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      client: true,
      owner: true,
    },
    orderBy: { updatedAt: 'desc' }
  });

  const groupedJobs = {
    urgent: jobs.filter((job) => job.priority === "URGENT"),
    open: jobs.filter((job) => job.status === "OPEN"),
    paused: jobs.filter((job) => job.status === "PAUSED"),
  };

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Jobs</p>
          <h1>岗位管理</h1>
          <p className="muted">
            当前查看人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={`/dashboard?role=${viewer.role.code}&userId=${viewer.id}`}>
            返回看板
          </Link>
          <Link className="button-primary" href={`/clients?role=${viewer.role.code}&userId=${viewer.id}`}>
            查看客户
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p>紧急岗位</p>
          <strong>{groupedJobs.urgent.length}</strong>
        </article>
        <article className="stat-card">
          <p>开放岗位</p>
          <strong>{groupedJobs.open.length}</strong>
        </article>
        <article className="stat-card">
          <p>暂停岗位</p>
          <strong>{groupedJobs.paused.length}</strong>
        </article>
      </section>

      <section className="candidate-list">
        {jobs.map((job) => (
          <article className="candidate-item" key={job.id}>
            <div className="candidate-topline">
              <div className="section-header">
                <h2>{job.title}</h2>
                <p className="candidate-meta">
                  {job.client.companyName} | {job.city} | {job.salaryRange}
                </p>
              </div>
              <div className="badge-row">
                <span className="badge badge-blue">{job.priority}</span>
                <span className="badge badge-green">{job.status}</span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-block">
                <strong>负责人</strong>
                <span>{job.owner.name}</span>
              </div>
              <div className="info-block">
                <strong>截止时间</strong>
                <span>{job.deadline?.toLocaleDateString() || "未设置"}</span>
              </div>
              <div className="info-block">
                <strong>客户</strong>
                <span>{job.client.companyName}</span>
              </div>
            </div>

            <p className="candidate-summary">{job.description}</p>
            <p className="muted">任职要求：{job.requirements}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
