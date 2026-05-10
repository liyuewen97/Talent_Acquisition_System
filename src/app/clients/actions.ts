"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PriorityLevel } from "@prisma/client";

export async function saveClient(formData: FormData) {
  const id = (formData.get("id") as string | null) || null;
  const viewerId = formData.get("viewerId") as string;
  const viewerRole = formData.get("viewerRole") as string;

  const companyName = ((formData.get("companyName") as string) || "").trim();
  const industry = ((formData.get("industry") as string) || "").trim() || null;
  const city = ((formData.get("city") as string) || "").trim() || null;
  const cooperationStatus = ((formData.get("cooperationStatus") as string) || "").trim() || "待推进";
  const priority = ((formData.get("priority") as string) || "MEDIUM").trim() as PriorityLevel;
  const ownerUserId = (formData.get("ownerUserId") as string) || viewerId;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (!companyName) {
    throw new Error("客户公司名称不能为空");
  }

  const data = {
    companyName,
    industry,
    city,
    cooperationStatus,
    priority,
    ownerUserId,
    notes,
  };

  if (id) {
    await prisma.client.update({
      where: { id },
      data,
    });
  } else {
    await prisma.client.create({
      data,
    });
  }

  revalidatePath("/clients");

  if (id) {
    redirect(`/clients/${id}?role=${viewerRole}&userId=${viewerId}`);
  }

  redirect(`/clients?role=${viewerRole}&userId=${viewerId}`);
}

