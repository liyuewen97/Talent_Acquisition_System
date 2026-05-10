import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientDetailPage({ params, searchParams }: ClientDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const roleValue = (Array.isArray(resolvedSearchParams.role) ? resolvedSearchParams.role[0] : resolvedSearchParams.role) || "ADMIN";
  const userIdValue = (Array.isArray(resolvedSearchParams.userId) ? resolvedSearchParams.userId[0] : resolvedSearchParams.userId);

  const isUuid = userIdValue && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdValue);

  const viewer =
    (await prisma.user.findFirst({
      where: isUuid ? { id: userIdValue } : { role: { code: roleValue as UserRoleCode } },
      include: { role: true },
    })) || (await prisma.user.findFirst({ include: { role: true } }));

  if (!viewer) {
    return <div>请先初始化数据库用户。</div>;
  }

  const client = await prisma.client.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!client) {
    notFound();
  }

  if (viewer.role.code === "INTERN" && client.ownerUserId !== viewer.id) {
    return <div>您没有权限查看此客户。</div>;
  }

  const jobs = await prisma.job.findMany({
    where: { clientId: client.id },
    include: { owner: true },
    orderBy: { updatedAt: "desc" },
  });

  const openJobs = jobs.filter((job) => job.status === "OPEN");
  const pausedJobs = jobs.filter((job) => job.status === "PAUSED");

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Client Detail</p>
          <h1>{client.companyName}</h1>
          <p className="muted">
            当前查看人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={`/clients?role=${viewer.role.code}&userId=${viewer.id}`}>
            返回客户列表
          </Link>
          <Link className="button-secondary" href={`/clients/${client.id}/edit?role=${viewer.role.code}&userId=${viewer.id}`}>
            编辑客户
          </Link>
          <Link className="button-primary" href={`/jobs?role=${viewer.role.code}&userId=${viewer.id}`}>
            查看全部岗位
          </Link>
        </div>
      </section>

      <section className="candidate-item">
        <div className="candidate-topline">
          <div className="section-header">
            <h2>
              {client.industry} | {client.city}
            </h2>
            <p className="candidate-meta">负责人：{client.owner.name}</p>
          </div>
          <div className="badge-row">
            <span className="badge badge-blue">{client.priority}</span>
            <span className="badge badge-green">{client.cooperationStatus}</span>
          </div>
        </div>

        <p className="candidate-summary">{client.notes}</p>
      </section>

      <section className="panel-grid">
        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>岗位需求</h2>
              <p className="muted">第一版先聚焦客户下的简版岗位管理。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {jobs.length === 0 ? (
                <div className="empty-state">暂无岗位</div>
              ) : (
                jobs.map((job) => (
                <div className="timeline-item" key={job.id}>
                  <h3>{job.title}</h3>
                  <p className="muted">
                    {job.city} | {job.salaryRange} | {job.status} | 负责人 {job.owner.name}
                  </p>
                  <p>{job.description}</p>
                  <p>要求：{job.requirements}</p>
                </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>客户摘要</h2>
              <p className="muted">后续会在这里补联系人、合作记录和提醒事项。</p>
            </div>
            <div className="info-grid" style={{ marginTop: 16 }}>
              <div className="info-block">
                <strong>岗位总数</strong>
                <span>{jobs.length}</span>
              </div>
              <div className="info-block">
                <strong>开放岗位</strong>
                <span>{openJobs.length}</span>
              </div>
              <div className="info-block">
                <strong>暂停岗位</strong>
                <span>{pausedJobs.length}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
