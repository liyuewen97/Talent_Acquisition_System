import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { USER_ROLES, canAccessAllCandidates } from "@/lib/permissions";
import type { CandidateStatus, UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type CandidatesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const resolvedSearchParams = await searchParams;
  
  // Get viewer info from query params (placeholder for real auth)
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

  const keyword = ((Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q) ?? "").trim();
  const status = (Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] : resolvedSearchParams.status) as CandidateStatus | undefined;
  const owner = (Array.isArray(resolvedSearchParams.owner) ? resolvedSearchParams.owner[0] : resolvedSearchParams.owner);

  // Build Prisma query based on permissions
  const where: any = {};
  
  if (!canAccessAllCandidates(viewer.role.code as any)) {
    where.OR = [
      { createdBy: viewer.id },
      { currentFollowUserId: viewer.id },
      { followUps: { some: { followUpUserId: viewer.id } } }
    ];
  }

  if (keyword) {
    where.OR = [
      ...(where.OR || []),
      { name: { contains: keyword, mode: 'insensitive' } },
      { phone: { contains: keyword, mode: 'insensitive' } },
      { currentCompany: { contains: keyword, mode: 'insensitive' } },
      { currentTitle: { contains: keyword, mode: 'insensitive' } },
      { city: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (owner) {
    where.currentFollowUserId = owner;
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      currentFollowUser: true,
      creator: true,
      tags: {
        include: {
          tag: true
        }
      },
      followUps: true,
    },
    orderBy: { updatedAt: 'desc' }
  });

  const allStatuses = ["NEW", "FOLLOWING", "AVAILABLE", "ON_HOLD", "ARCHIVED"];
  const owners = await prisma.user.findMany({
    where: viewer.role.code === "INTERN" ? { id: viewer.id } : {},
    orderBy: { name: 'asc' }
  });

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Candidates</p>
          <h1>候选人资源库</h1>
          <p className="muted">
            当前登录人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href="/login">
            切换角色
          </Link>
          <Link className="button-secondary" href={`/candidates/upload?role=${viewer.role.code}&userId=${viewer.id}`}>
            简历解析入库
          </Link>
          <Link className="button-secondary" href={`/tags?role=${viewer.role.code}&userId=${viewer.id}`}>
            标签管理
          </Link>
          <Link className="button-secondary" href={`/candidates/new?role=${viewer.role.code}&userId=${viewer.id}`}>
            手动新增候选人
          </Link>
          <Link className="button-primary" href="/">
            返回首页
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <p>当前可见候选人</p>
          <strong>{candidates.length}</strong>
        </article>
        <article className="stat-card">
          <p>有跟进记录的候选人</p>
          <strong>{candidates.filter((c) => c.followUps.length > 0).length}</strong>
        </article>
        <article className="stat-card">
          <p>待继续跟进</p>
          <strong>{candidates.filter((c) => c.status === "FOLLOWING").length}</strong>
        </article>
      </section>

      <section className="toolbar">
        <div className="section-header">
          <h2>筛选条件</h2>
          <p className="muted">已接入数据库查询和权限过滤。</p>
        </div>
        <form className="toolbar-grid">
          <input type="hidden" name="role" value={viewer.role.code} />
          <input type="hidden" name="userId" value={viewer.id} />

          <div className="field-group">
            <label htmlFor="q">关键词</label>
            <input defaultValue={keyword} id="q" name="q" placeholder="姓名、手机号、公司、职位" />
          </div>

          <div className="field-group">
            <label htmlFor="status">状态</label>
            <select defaultValue={status} id="status" name="status">
              <option value="">全部状态</option>
              {allStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="owner">当前跟进人</label>
            <select defaultValue={owner} id="owner" name="owner">
              <option value="">全部跟进人</option>
              {owners.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group" style={{ alignSelf: "end" }}>
            <button className="button-primary" type="submit">
              查询
            </button>
          </div>
        </form>
      </section>

      <section className="candidate-list">
        {candidates.length === 0 ? (
          <div className="empty-state">当前没有符合条件的候选人。</div>
        ) : (
          candidates.map((candidate) => (
            <article className="candidate-item" key={candidate.id}>
              <div className="candidate-topline">
                <div className="section-header">
                  <h2>{candidate.name}</h2>
                  <p className="candidate-meta">
                    {candidate.currentTitle} | {candidate.currentCompany} | {candidate.city}
                  </p>
                </div>
                <div className="badge-row">
                  <span className="badge badge-blue">{candidate.status}</span>
                  <span className="badge badge-green">{candidate.source}</span>
                </div>
              </div>

              <p className="candidate-summary">{candidate.summary}</p>

              <div className="info-grid">
                <div className="info-block">
                  <strong>手机号</strong>
                  <span>{candidate.phone}</span>
                </div>
                <div className="info-block">
                  <strong>当前跟进人</strong>
                  <span>{candidate.currentFollowUser?.name || "未分配"}</span>
                </div>
                <div className="info-block">
                  <strong>最近跟进</strong>
                  <span>{candidate.lastFollowUpAt?.toLocaleString() || "无"}</span>
                </div>
                <div className="info-block">
                  <strong>录入人</strong>
                  <span>{candidate.creator.name}</span>
                </div>
              </div>

              <div className="badge-row">
                {candidate.tags.map((ct) => (
                  <span className="badge badge-amber" key={ct.tag.id}>
                    {ct.tag.name}
                  </span>
                ))}
              </div>

              <div className="action-row">
                <Link
                  className="button-primary"
                  href={`/candidates/${candidate.id}?role=${viewer.role.code}&userId=${viewer.id}`}
                >
                  查看详情
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
