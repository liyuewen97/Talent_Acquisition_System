import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/client-form";
import type { UserRoleCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type NewClientPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewClientPage({ searchParams }: NewClientPageProps) {
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

  const users = await prisma.user.findMany({
    where: viewer.role.code === "INTERN" ? { id: viewer.id } : {},
    orderBy: { name: "asc" },
  });

  const backHref = `/clients?role=${viewer.role.code}&userId=${viewer.id}`;

  return (
    <main>
      <ClientForm mode="create" backHref={backHref} viewerId={viewer.id} viewerRole={viewer.role.code} users={users} />
    </main>
  );
}
