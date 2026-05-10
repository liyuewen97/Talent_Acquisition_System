"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CandidateStatus, UserRoleCode, FollowUpType } from "@prisma/client";
import { getDocumentProxy, extractText } from "unpdf";
import mammoth from "mammoth";

function safeDate(value: any) {
  if (!value || value === "") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export async function saveCandidate(formData: FormData) {
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const gender = (formData.get("gender") as string) || null;
  const birthDate = (formData.get("birthDate") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const city = (formData.get("city") as string) || null;
  const source = (formData.get("source") as string) || null;
  const currentCompany = (formData.get("company") as string) || null;
  const currentTitle = (formData.get("title") as string) || null;
  const status = formData.get("status") as CandidateStatus;
  const summary = (formData.get("summary") as string) || null;
  const skills = (formData.get("skills") as string) || null;
  const currentFollowUserId = (formData.get("followUser") as string) || null;
  const tagIds = (formData.getAll("tagIds") as string[]).filter(Boolean);

  // Viewer info for logging and permissions
  const viewerId = formData.get("viewerId") as string;
  const viewerRole = formData.get("viewerRole") as string;

  // Extract Education, Work Experience, and Projects from formData
  const educations: any[] = [];
  const workExperiences: any[] = [];
  const projects: any[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("edu_")) {
      const parts = key.split("_");
      const index = parseInt(parts[parts.length - 1]);
      const field = parts.slice(1, -1).join("_");
      if (!educations[index]) educations[index] = {};
      educations[index][field] = value;
    }
    if (key.startsWith("work_")) {
      const parts = key.split("_");
      const index = parseInt(parts[parts.length - 1]);
      const field = parts.slice(1, -1).join("_");
      if (!workExperiences[index]) workExperiences[index] = {};
      workExperiences[index][field] = value;
    }
    if (key.startsWith("proj_")) {
      const parts = key.split("_");
      const index = parseInt(parts[parts.length - 1]);
      const field = parts.slice(1, -1).join("_");
      if (!projects[index]) projects[index] = {};
      projects[index][field] = value;
    }
  }

  const cleanEducations = educations
    .filter((e) => e && e.schoolName)
    .map((e) => ({
      schoolName: e.schoolName,
      degree: e.degree || "本科",
      major: e.major || "",
      startDate: safeDate(e.startDate),
      endDate: safeDate(e.endDate),
      isTopDegree: e.isTopDegree === "on",
    }));

  const cleanWorkExperiences = workExperiences
    .filter((w) => w && w.companyName)
    .map((w) => ({
      companyName: w.companyName,
      title: w.title || "",
      startDate: safeDate(w.startDate),
      endDate: safeDate(w.endDate),
      description: w.description || "",
    }));

  const cleanProjects = projects
    .filter((p) => p && p.projectName)
    .map((p) => ({
      projectName: p.projectName,
      role: p.role || "",
      startDate: safeDate(p.startDate),
      endDate: safeDate(p.endDate),
      description: p.description || "",
      link: p.link || "",
    }));

  const data: any = {
    name,
    gender,
    birthDate: safeDate(birthDate),
    phone,
    email,
    city,
    source,
    currentCompany,
    currentTitle,
    status,
    summary,
    skills,
    currentFollowUserId,
  };

  if (id) {
    // Update
    await prisma.$transaction(async (tx) => {
      await tx.candidate.update({
        where: { id },
        data,
      });

      // Sync relations
      await tx.candidateEducation.deleteMany({ where: { candidateId: id } });
      await tx.candidateWorkExperience.deleteMany({ where: { candidateId: id } });
      await tx.candidateProject.deleteMany({ where: { candidateId: id } });
      await tx.candidateTag.deleteMany({ where: { candidateId: id } });

      if (cleanEducations.length > 0) {
        await tx.candidateEducation.createMany({
          data: cleanEducations.map((e) => ({ ...e, candidateId: id })),
        });
      }

      if (cleanWorkExperiences.length > 0) {
        await tx.candidateWorkExperience.createMany({
          data: cleanWorkExperiences.map((w) => ({ ...w, candidateId: id })),
        });
      }

      if (cleanProjects.length > 0) {
        await tx.candidateProject.createMany({
          data: cleanProjects.map((p) => ({ ...p, candidateId: id })),
        });
      }

      if (tagIds.length > 0) {
        await tx.candidateTag.createMany({
          data: tagIds.map((tagId) => ({ candidateId: id, tagId })),
        });
      }

      await tx.candidateChangeLog.create({
        data: {
          candidateId: id,
          actorUserId: viewerId,
          actionType: "UPDATE_CANDIDATE",
        },
      });
    });
  } else {
    // Create
    const newCandidate = await prisma.candidate.create({
      data: {
        ...data,
        createdBy: viewerId,
        educations: { create: cleanEducations },
        workExperiences: { create: cleanWorkExperiences },
        projects: { create: cleanProjects },
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    });

    await prisma.candidateChangeLog.create({
      data: {
        candidateId: newCandidate.id,
        actorUserId: viewerId,
        actionType: "CREATE_CANDIDATE",
      },
    });
  }

  revalidatePath("/candidates");
  if (id) {
    revalidatePath(`/candidates/${id}`);
    redirect(`/candidates/${id}?role=${viewerRole}&userId=${viewerId}`);
  } else {
    redirect(`/candidates?role=${viewerRole}&userId=${viewerId}`);
  }
}

// Heuristic parsing helper
function extractInfo(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  
  // 1. Phone: Standard Chinese mobile format
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  
  // 2. Email: Simple email regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  // 3. Name: Usually in the first 3 lines, 2-4 characters (heuristic)
  let name = "未知候选人";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.length >= 2 && line.length <= 4 && /^[\u4e00-\u9fa5]+$/.test(line)) {
      name = line;
      break;
    }
  }

  // 4. Education: Look for degree keywords
  const degreeKeywords = ["大专", "专升本", "本科", "硕士", "研究生", "博士", "其他"];
  const eduLine = lines.find(l => degreeKeywords.some(k => l.includes(k)));
  let degree = "本科";
  let schoolName = "未知学校";
  if (eduLine) {
    degree = degreeKeywords.find(k => eduLine.includes(k)) || "本科";
    // Try to extract school name (usually contains "大学" or "学院")
    const schoolMatch = eduLine.match(/[^\s,，|]+(大学|学院)/);
    if (schoolMatch) schoolName = schoolMatch[0];
  }

  // 5. Current Company & Title (Heuristic: Look for common patterns)
  let currentCompany = "未知公司";
  let currentTitle = "未知职位";
  const workKeywords = ["公司", "集团", "有限", "中心"];
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (workKeywords.some(k => line.includes(k)) && !line.includes("大学")) {
      currentCompany = line.split(/[| 	,，]/)[0];
      // Often the next line or same line after separator is the title
      break;
    }
  }

  return { name, phone: phoneMatch?.[0] || "", email: emailMatch?.[0] || "", degree, schoolName, currentCompany, currentTitle };
}

// Placeholder for LLM integration
function extractFirstJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    const extracted = extractFirstJsonObject(raw);
    if (!extracted) return null;
    try {
      return JSON.parse(extracted);
    } catch {
      return null;
    }
  }
}

async function callLLM(text: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { ok: false, error: "未检测到 DEEPSEEK_API_KEY" };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `你是一个专业的猎头助手，拥有极强的简历分析和信息提取能力。
你的任务是从非结构化的简历文本中提取核心信息，并严格按照 JSON 格式输出。

提取规则：
1. 姓名(name)：识别候选人真实姓名。
2. 性别(gender)：输出 "男" / "女" / ""。
3. 出生日期(birthDate)：尽量提取出生年月日，输出 YYYY-MM-DD，无法确定则输出 ""。
4. 手机号(phone)：提取11位中国手机号。
5. 邮箱(email)：提取邮箱地址，无法则输出 ""。
6. 城市(city)：识别候选人当前所在城市。
7. 当前公司(currentCompany)：识别最近的一份工作单位。
8. 当前职位(currentTitle)：识别最近的一份工作职位。
9. 个人总结/自我评价(summary)：用 2-4 句话概括候选人的核心竞争力、经历亮点、求职动机（如果存在）。
10. 掌握技能(skills)：输出数组，包含候选人掌握的技能关键词（如 Java、微服务、SaaS、产品增长等），建议 5-15 个。
11. 标签(tags)：根据技能和行业提取3-8个核心关键词标签。
12. 教育经历(educations)：提取所有教育背景，包含：schoolName(学校), degree(学历，必须是以下枚举之一：大专/专升本/本科/硕士/博士/其他), major(专业), startDate(开始日期: YYYY-MM-DD), endDate(结束日期: YYYY-MM-DD)。
13. 工作经历(workExperiences)：提取所有工作背景，包含：companyName(公司名), title(职位), startDate, endDate, description(工作描述)。
14. 项目经历(projects)：提取主要项目经验，包含：projectName(项目名), role(角色), startDate, endDate, description(项目描述), link(项目链接)。

注意事项：
- 如果某个信息在文本中不存在，请填充为空字符串 ""。
- 日期请尽量转换为 YYYY-MM-DD 格式。
- 确保输出的是合法的 JSON 对象，且只输出 JSON（不要包含任何解释性文本）。`
          },
          {
            role: "user",
            content: `请解析以下简历文本：\n\n${text.slice(0, 6000)}`
          }
        ]
      }),
    });

    clearTimeout(timeout);

    const raw = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        error: `DeepSeek API 错误 ${response.status}: ${raw.slice(0, 200)}`,
      };
    }

    const payload = safeJsonParse(raw);
    const content = payload?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return { ok: false, error: "DeepSeek 返回内容为空或格式异常" };
    }

    const parsed = safeJsonParse(content);
    if (!parsed) {
      return { ok: false, error: "DeepSeek 返回内容无法解析为 JSON" };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return { ok: false, error: `DeepSeek 调用失败: ${message}` };
  }
}

export async function parseResume(formData: FormData) {
  const file = formData.get("file") as File;
  const text = formData.get("text") as string;

  let extractedText = text || "";

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith(".pdf")) {
        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const { text: pdfText } = await extractText(pdf);
        extractedText = pdfText.join("\n");
      } else if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else {
        throw new Error("目前仅支持 PDF 和 DOCX 格式。");
      }
    } catch (err: any) {
      console.error("File parsing error:", err);
      throw new Error(`文件解析失败: ${err.message || "请尝试粘贴文本。"}`);
    }
  }

  if (!extractedText.trim()) {
    throw new Error("未检测到有效文本内容。");
  }

  // 1. Try real LLM if API Key is available
  const llm = await callLLM(extractedText);
  if (llm.ok && llm.data) {
    const llmResult = llm.data;
    const normalized = {
      name: llmResult.name || "",
      gender: llmResult.gender || "",
      birthDate: llmResult.birthDate || "",
      phone: llmResult.phone || "",
      email: llmResult.email || "",
      city: llmResult.city || "",
      currentCompany: llmResult.currentCompany || "",
      currentTitle: llmResult.currentTitle || "",
      summary: llmResult.summary || "",
      skills: Array.isArray(llmResult.skills) ? llmResult.skills : typeof llmResult.skills === "string" ? llmResult.skills.split(/[,，、\n]/).map((s: string) => s.trim()).filter(Boolean) : [],
      tags: Array.isArray(llmResult.tags) ? llmResult.tags : [],
      educations: Array.isArray(llmResult.educations) ? llmResult.educations : [],
      workExperiences: Array.isArray(llmResult.workExperiences) ? llmResult.workExperiences : [],
      projects: Array.isArray(llmResult.projects) ? llmResult.projects : [],
      rawText: extractedText,
      llmUsed: true,
      llmError: "",
    };

    return normalized;
  }

  // 2. Fallback to smarter heuristic extraction
  const info = extractInfo(extractedText);

  return {
    name: info.name,
    gender: "",
    birthDate: "",
    phone: info.phone,
    email: info.email,
    city: "未知", // Heuristic could be improved
    currentCompany: info.currentCompany,
    currentTitle: info.currentTitle,
    summary: `(由启发式算法解析) 简历共 ${extractedText.length} 字。建议接入 DeepSeek API 以获得更高准确度。`,
    skills: [],
    tags: ["待分类"],
    rawText: extractedText,
    llmUsed: false,
    llmError: llm.error || "",
    educations: [
      {
        schoolName: info.schoolName,
        degree: info.degree,
        major: "未知专业",
        startDate: "",
        endDate: "",
      },
    ],
    workExperiences: [],
    projects: [],
  };
}

export async function addFollowUp(formData: FormData) {
  const candidateId = formData.get("candidateId") as string;
  const userId = formData.get("userId") as string;
  const followUpType = formData.get("followUpType") as FollowUpType;
  const content = formData.get("content") as string;
  const nextAction = formData.get("nextAction") as string;
  const nextFollowUpAtStr = formData.get("nextFollowUpAt") as string;

  await prisma.candidateFollowUp.create({
    data: {
      candidateId,
      followUpUserId: userId,
      followUpType,
      content,
      nextAction,
      nextFollowUpAt: safeDate(nextFollowUpAtStr),
    },
  });

  // Update last follow up time on candidate
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { lastFollowUpAt: new Date() },
  });

  // Create log
  await prisma.candidateChangeLog.create({
    data: {
      candidateId,
      actorUserId: userId,
      actionType: "ADD_FOLLOW_UP",
      metadata: { followUpType, content },
    },
  });

  revalidatePath(`/candidates/${candidateId}`);
}
