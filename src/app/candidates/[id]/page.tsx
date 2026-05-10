import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addFollowUp } from "@/app/candidates/actions";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CandidateDetailPage({ params, searchParams }: CandidateDetailPageProps) {
  const { id } = await params;
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

  const candidate = (await prisma.candidate.findUnique({
    where: { id },
    include: {
      currentFollowUser: true,
      creator: true,
      educations: { orderBy: { startDate: "desc" } },
      workExperiences: { orderBy: { startDate: "desc" } },
      projects: { orderBy: { startDate: "desc" } },
      followUps: {
        include: { followUpUser: true },
        orderBy: { createdAt: "desc" },
      },
      changeLogs: {
        include: { actorUser: true },
        orderBy: { createdAt: "desc" },
      },
      tags: { include: { tag: true } },
    } as any,
  })) as any;

  if (!candidate) {
    notFound();
  }

  // Permission check for INTERN
  if (viewer.role.code === "INTERN") {
    const hasAccess = candidate.createdBy === viewer.id || 
                      candidate.currentFollowUserId === viewer.id ||
                      candidate.followUps.some((fu: any) => fu.followUpUserId === viewer.id);
    if (!hasAccess) {
      return <div>您没有权限查看此候选人。</div>;
    }
  }

  const fromQuery = new URLSearchParams();
  fromQuery.set("role", viewer.role.code);
  fromQuery.set("userId", viewer.id);

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Candidate Detail</p>
          <h1>{candidate.name}</h1>
          <p className="muted">
            当前查看人为 {viewer.name}，角色为 {viewer.role.name}。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={`/candidates?${fromQuery.toString()}`}>
            返回列表
          </Link>
          <Link className="button-secondary" href={`/candidates/${candidate.id}/edit?${fromQuery.toString()}`}>
            编辑候选人
          </Link>
          <Link className="button-primary" href="/login">
            切换角色
          </Link>
        </div>
      </section>

      <section className="candidate-item">
        <div className="candidate-topline">
          <div className="section-header">
            <h2>
              {candidate.currentTitle} | {candidate.currentCompany}
            </h2>
            <p className="candidate-meta">
              {candidate.city} | {candidate.phone} | {candidate.email || "无邮箱"} | 来源：{candidate.source}
            </p>
          </div>
          <div className="badge-row">
            <span className="badge badge-blue">{candidate.status}</span>
            <span className="badge badge-green">当前跟进人：{candidate.currentFollowUser?.name || "未分配"}</span>
          </div>
        </div>

        <p className="candidate-summary">{candidate.summary}</p>
        {candidate.skills ? <p className="candidate-summary">技能：{candidate.skills}</p> : null}

        <div className="badge-row">
          {candidate.tags.length === 0 ? (
            <span className="badge">暂无标签</span>
          ) : (
            candidate.tags.map((ct: any) => (
              <span className="badge badge-amber" key={ct.tag.id}>
                {ct.tag.name}
              </span>
            ))
          )}
        </div>

        <div className="info-grid">
          <div className="info-block">
            <strong>录入人</strong>
            <span>{candidate.creator.name}</span>
          </div>
          <div className="info-block">
            <strong>性别 / 出生</strong>
            <span>
              {candidate.gender || "未知"} / {candidate.birthDate ? candidate.birthDate.toLocaleDateString() : "未知"}
            </span>
          </div>
          <div className="info-block">
            <strong>最近跟进时间</strong>
            <span>{candidate.lastFollowUpAt?.toLocaleString() || "无"}</span>
          </div>
          <div className="info-block">
            <strong>教育经历数</strong>
            <span>{candidate.educations.length}</span>
          </div>
          <div className="info-block">
            <strong>跟进记录数</strong>
            <span>{candidate.followUps.length}</span>
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>教育经历</h2>
              <p className="muted">支持多段教育经历。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {candidate.educations.map((education: any) => (
                <div className="timeline-item" key={education.id}>
                  <h3>
                    {education.schoolName} | {education.degree}
                  </h3>
                  <p>{education.major}</p>
                  <p className="muted">
                    {education.startDate?.toLocaleDateString()} 至 {education.endDate?.toLocaleDateString() || "至今"}
                    {education.isTopDegree ? " | 最高学历" : ""}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>工作经历</h2>
              <p className="muted">支持多段工作经历。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {candidate.workExperiences.map((workExperience: any) => (
                <div className="timeline-item" key={workExperience.id}>
                  <h3>
                    {workExperience.companyName} | {workExperience.title}
                  </h3>
                  <p className="muted">
                    {workExperience.startDate?.toLocaleDateString()} 至 {workExperience.endDate?.toLocaleDateString() || "至今"}
                  </p>
                  <p>{workExperience.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>项目经验</h2>
              <p className="muted">展示候选人的主要项目经历。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {candidate.projects.length === 0 ? (
                <div className="empty-state">暂无项目经历</div>
              ) : (
                candidate.projects.map((project: any) => (
                  <div className="timeline-item" key={project.id}>
                    <h3>
                      {project.projectName} {project.role ? `| ${project.role}` : ""}
                    </h3>
                    <p className="muted">
                      {project.startDate?.toLocaleDateString()} 至 {project.endDate?.toLocaleDateString() || "至今"}
                    </p>
                    <p>{project.description}</p>
                    {project.link ? <p className="muted">{project.link}</p> : null}
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="page-stack">
          <article className="card">
            <div className="section-header">
              <h2>最新跟进</h2>
              <p className="muted">展示最近的跟进记录。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {candidate.followUps.map((followUp: any) => (
                <div className="timeline-item" key={followUp.id}>
                  <h3>
                    {followUp.followUpType} | {followUp.followUpUser.name}
                  </h3>
                  <p className="muted">{followUp.createdAt.toLocaleString()}</p>
                  <p>{followUp.content}</p>
                  {followUp.nextAction ? <p>下一步：{followUp.nextAction}</p> : null}
                  {followUp.nextFollowUpAt ? <p>下次跟进：{followUp.nextFollowUpAt.toLocaleString()}</p> : null}
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>新增跟进</h2>
              <p className="muted">记录本次沟通的详细情况。</p>
            </div>
            <form action={addFollowUp} className="form-grid" style={{ marginTop: 16 }}>
              <input type="hidden" name="candidateId" value={candidate.id} />
              <input type="hidden" name="userId" value={viewer.id} />
              <div className="field-group">
                <label htmlFor="followUpType">跟进方式</label>
                <select defaultValue="PHONE_CALL" id="followUpType" name="followUpType">
                  <option value="INITIAL_CONTACT">初次联系</option>
                  <option value="PHONE_CALL">电话沟通</option>
                  <option value="WECHAT">微信沟通</option>
                  <option value="RESUME_RECEIVED">获取简历</option>
                  <option value="PRE_RECOMMENDATION">推荐前沟通</option>
                  <option value="FOLLOW_LATER">待后续跟进</option>
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="nextFollowUpAt">下次跟进时间</label>
                <input type="datetime-local" id="nextFollowUpAt" name="nextFollowUpAt" />
              </div>
              <div className="field-group form-span-2">
                <label htmlFor="content">跟进内容</label>
                <textarea
                  id="content"
                  name="content"
                  required
                  placeholder="记录本次沟通结论、意向、薪资、岗位匹配点等"
                />
              </div>
              <div className="field-group form-span-2">
                <label htmlFor="nextAction">下一步动作</label>
                <textarea id="nextAction" name="nextAction" placeholder="例如：安排复聊、推荐给客户、补充资料" />
              </div>
              <div className="action-row form-span-2" style={{ marginTop: 16 }}>
                <button className="button-primary" type="submit">
                  保存跟进记录
                </button>
              </div>
            </form>
          </article>

          <article className="card">
            <div className="section-header">
              <h2>编辑日志</h2>
              <p className="muted">关键编辑操作已留痕。</p>
            </div>
            <div className="timeline" style={{ marginTop: 16 }}>
              {candidate.changeLogs.map((changeLog: any) => (
                <div className="timeline-item" key={changeLog.id}>
                  <h3>{changeLog.actionType}</h3>
                  <p className="muted">
                    {changeLog.actorUser.name} | {changeLog.createdAt.toLocaleString()}
                  </p>
                  {changeLog.fieldName ? <p>字段：{changeLog.fieldName}</p> : null}
                  {changeLog.oldValue || changeLog.newValue ? (
                    <p>
                      变更：{changeLog.oldValue || "空"} {"->"} {changeLog.newValue || "空"}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
