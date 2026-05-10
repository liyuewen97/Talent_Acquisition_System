import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTag, updateTag } from "@/app/tags/actions";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type TagsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
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

  const tags = await prisma.tag.findMany({
    include: {
      creator: true,
      _count: { select: { candidates: true } },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  const backHref = `/dashboard?role=${viewer.role.code}&userId=${viewer.id}`;

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Tags</p>
          <h1>标签管理</h1>
          <p className="muted">维护候选人标签体系，用于筛选与匹配。</p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={backHref}>
            返回看板
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>新增/更新标签</h2>
          <p className="muted">名称相同会自动更新（避免重复标签）。</p>
        </div>
        <form action={createTag} className="form-grid" style={{ marginTop: 16 }}>
          <input type="hidden" name="createdBy" value={viewer.id} />
          <div className="field-group">
            <label>标签名称</label>
            <input name="name" placeholder="如：Java / 产品经理 / 深圳" required />
          </div>
          <div className="field-group">
            <label>颜色</label>
            <input name="color" placeholder="如：blue / green / #2563eb" />
          </div>
          <div className="field-group">
            <label>状态</label>
            <select name="status" defaultValue="ACTIVE">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="field-group" style={{ alignSelf: "end" }}>
            <button className="button-primary" type="submit">
              保存标签
            </button>
          </div>
        </form>
      </section>

      <section className="candidate-list">
        {tags.map((tag) => (
          <article className="candidate-item" key={tag.id}>
            <div className="candidate-topline">
              <div className="section-header">
                <h2>{tag.name}</h2>
                <p className="candidate-meta">
                  状态：{tag.status} | 颜色：{tag.color || "未设置"} | 关联候选人：{tag._count.candidates}
                </p>
              </div>
              <div className="badge-row">
                <span className="badge badge-blue">{tag.status}</span>
                <span className="badge badge-amber">{tag.creator.name}</span>
              </div>
            </div>

            <form action={updateTag} className="form-grid">
              <input type="hidden" name="id" value={tag.id} />
              <div className="field-group">
                <label>颜色</label>
                <input name="color" defaultValue={tag.color || ""} placeholder="如：blue / green / #2563eb" />
              </div>
              <div className="field-group">
                <label>状态</label>
                <select name="status" defaultValue={tag.status}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="field-group" style={{ alignSelf: "end" }}>
                <button className="button-secondary" type="submit">
                  更新
                </button>
              </div>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
