import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type ClientsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
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

  const clients = await prisma.client.findMany({
    where,
    include: {
      owner: true,
      jobs: true,
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Clients</p>
          <h1>客户管理</h1>
          <p className="muted">
            当前查看人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={`/dashboard?role=${viewer.role.code}&userId=${viewer.id}`}>
            返回看板
          </Link>
          <Link className="button-secondary" href={`/clients/new?role=${viewer.role.code}&userId=${viewer.id}`}>
            新增客户
          </Link>
          <Link className="button-primary" href={`/jobs?role=${viewer.role.code}&userId=${viewer.id}`}>
            查看岗位
          </Link>
        </div>
      </section>

      <section className="candidate-list">
        {clients.map((client) => {
          const openJobs = client.jobs.filter((job) => job.status === "OPEN");

          return (
            <article className="candidate-item" key={client.id}>
              <div className="candidate-topline">
                <div className="section-header">
                  <h2>{client.companyName}</h2>
                  <p className="candidate-meta">
                    {client.industry} | {client.city} | 负责人 {client.owner.name}
                  </p>
                </div>
                <div className="badge-row">
                  <span className="badge badge-blue">{client.priority}</span>
                  <span className="badge badge-green">{client.cooperationStatus}</span>
                </div>
              </div>

              <p className="candidate-summary">{client.notes}</p>

              <div className="info-grid">
                <div className="info-block">
                  <strong>开放岗位数</strong>
                  <span>{openJobs.length}</span>
                </div>
                <div className="info-block">
                  <strong>全部岗位数</strong>
                  <span>{client.jobs.length}</span>
                </div>
                <div className="info-block">
                  <strong>最高优先级</strong>
                  <span>{client.jobs.length > 0 ? "已维护" : "暂无"}</span>
                </div>
              </div>

              <div className="action-row">
                <Link className="button-primary" href={`/clients/${client.id}?role=${viewer.role.code}&userId=${viewer.id}`}>
                  查看客户详情
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
