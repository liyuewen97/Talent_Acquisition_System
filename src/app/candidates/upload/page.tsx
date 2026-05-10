import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResumeParser } from "@/components/resume-parser";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type UploadPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = (Array.isArray(resolvedSearchParams.role) ? resolvedSearchParams.role[0] : resolvedSearchParams.role) || "ADMIN";
  const userId = (Array.isArray(resolvedSearchParams.userId) ? resolvedSearchParams.userId[0] : resolvedSearchParams.userId);
  
  const viewer = await prisma.user.findFirst({
    where: userId ? { id: userId } : { role: { code: role as UserRoleCode } },
    include: { role: true }
  }) || await prisma.user.findFirst({ include: { role: true } });

  if (!viewer) {
    return <div>请先初始化数据库用户。</div>;
  }

  const backHref = `/candidates?role=${viewer.role.code}&userId=${viewer.id}`;

  return (
    <main className="page-stack">
      <section className="page-header">
        <div className="section-header">
          <p className="kicker">Resume Parsing Agent</p>
          <h1>简历解析入库</h1>
          <p className="muted">
            上传 PDF 简历或直接粘贴简历文本，AI Agent 将自动为您提取结构化信息。
          </p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={backHref}>
            返回列表
          </Link>
        </div>
      </section>

      <ResumeParser viewerId={viewer.id} viewerRole={viewer.role.code} />
    </main>
  );
}
