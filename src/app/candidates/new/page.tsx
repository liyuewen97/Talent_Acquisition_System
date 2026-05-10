import { CandidateForm } from "@/components/candidate-form";
import { prisma } from "@/lib/prisma";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type NewCandidatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCandidatePage({ searchParams }: NewCandidatePageProps) {
  const resolvedSearchParams = await searchParams;
  const role = (Array.isArray(resolvedSearchParams.role) ? resolvedSearchParams.role[0] : resolvedSearchParams.role) || "ADMIN";
  const userId = (Array.isArray(resolvedSearchParams.userId) ? resolvedSearchParams.userId[0] : resolvedSearchParams.userId);
  
  const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  const viewer = await prisma.user.findFirst({
    where: isUuid ? { id: userId } : { role: { code: role as UserRoleCode } },
    include: { role: true }
  }) || await prisma.user.findFirst({ include: { role: true } });

  if (!viewer) {
    return <div>请先初始化数据库用户。</div>;
  }

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  const tags = await prisma.tag.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  const backHref = `/candidates?role=${viewer.role.code}&userId=${viewer.id}`;

  return (
    <main>
      <CandidateForm 
        backHref={backHref} 
        mode="create" 
        viewerId={viewer.id} 
        viewerRole={viewer.role.code}
        users={users}
        availableTags={tags}
      />
    </main>
  );
}
