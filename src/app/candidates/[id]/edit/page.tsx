import { notFound } from "next/navigation";
import { CandidateForm } from "@/components/candidate-form";
import { prisma } from "@/lib/prisma";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type EditCandidatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditCandidatePage({ params, searchParams }: EditCandidatePageProps) {
  const { id } = await params;
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

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      educations: true,
      workExperiences: true,
      projects: true,
      tags: { include: { tag: true } }
    }
  });

  if (!candidate) {
    notFound();
  }

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  const tags = await prisma.tag.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  const backHref = `/candidates/${candidate.id}?role=${viewer.role.code}&userId=${viewer.id}`;

  return (
    <main>
      <CandidateForm 
        backHref={backHref} 
        candidate={candidate} 
        mode="edit" 
        viewerId={viewer.id}
        viewerRole={viewer.role.code}
        users={users}
        availableTags={tags}
      />
    </main>
  );
}
