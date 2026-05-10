"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTag(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const color = (formData.get("color") as string | null) || null;
  const status = ((formData.get("status") as string | null) || "ACTIVE").trim();
  const createdBy = formData.get("createdBy") as string;

  if (!name) {
    throw new Error("标签名称不能为空");
  }

  await prisma.tag.upsert({
    where: { name },
    update: {
      color,
      status,
    },
    create: {
      name,
      color,
      status,
      createdBy,
    },
  });

  revalidatePath("/tags");
}

export async function updateTag(formData: FormData) {
  const id = formData.get("id") as string;
  const color = (formData.get("color") as string | null) || null;
  const status = ((formData.get("status") as string | null) || "ACTIVE").trim();

  await prisma.tag.update({
    where: { id },
    data: { color, status },
  });

  revalidatePath("/tags");
}

