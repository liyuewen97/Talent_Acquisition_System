import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { role: { code: "asc" } },
    });
  } catch {
    users = [];
  }

  // Fallback demo users if DB is empty
  const demoUsersFallback = [
    { id: 'user-admin', name: '创始人 (演示)', role: { code: 'ADMIN', name: '管理员' } },
    { id: 'user-assistant-01', name: '王助理 (演示)', role: { code: 'ASSISTANT', name: '猎头助理' } },
    { id: 'user-intern-01', name: '小陈 (演示)', role: { code: 'INTERN', name: '实习生' } },
  ];

  const displayUsers = users.length > 0 ? users : demoUsersFallback;

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Demo Access</p>
          <h1>选择登录角色</h1>
          <p className="muted">当前先用演示登录模拟权限切换，后续会替换为正式账号密码登录。</p>
        </div>
        <Link className="button-secondary" href="/">
          返回首页
        </Link>
      </section>

      <section className="card-grid">
        {displayUsers.map((user: any) => (
          <article className="card" key={user.id}>
            <div className="section-header">
              <span className="badge badge-blue">{user.role.name}</span>
              <h2>{user.name}</h2>
              <p className="muted">{user.role.code === "ADMIN" ? "创始人" : user.role.code === "ASSISTANT" ? "猎头助理" : "实习生"}</p>
            </div>
            <ul>
              <li>角色编码：{user.role.code}</li>
              <li>数据库 ID：{user.id}</li>
              <li>可见范围按当前权限口径模拟</li>
            </ul>
            <div className="action-row" style={{ marginTop: 20 }}>
              <Link className="button-primary" href={`/candidates?role=${user.role.code}&userId=${user.id}`}>
                进入候选人库
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
