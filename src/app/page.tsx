import Link from "next/link";

const sections = [
  {
    title: "当前已落地",
    items: ["Next.js App Router 项目骨架", "Prisma 与 PostgreSQL 基础配置", "V1 候选人核心数据模型"],
  },
  {
    title: "已开放体验",
    items: ["角色切换登录页", "候选人列表页", "候选人详情页", "跟进记录与编辑日志展示"],
  },
  {
    title: "下一步开发",
    items: ["真实登录与权限中间件", "候选人编辑表单", "简历上传与解析流程", "客户和岗位简版页面"],
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="kicker">Talent Acquisition System</p>
        <h1>猎头团队人才管理系统</h1>
        <p>项目已经完成 V1 产品设计与核心数据建模，当前仓库已进入可继续开发的初始化阶段。</p>
        <div className="action-row">
          <Link className="button-primary" href="/login">
            进入演示登录
          </Link>
          <Link className="button-secondary" href="/candidates?role=ADMIN">
            查看人才库
          </Link>
          <Link className="button-secondary" href="/candidates/upload?role=ADMIN">
            AI 简历解析
          </Link>
        </div>
      </section>

      <section className="card-grid" style={{ marginTop: 32 }}>
        {sections.map((section) => (
          <article className="card" key={section.title}>
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
