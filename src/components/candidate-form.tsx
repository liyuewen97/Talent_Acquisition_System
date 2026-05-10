"use client";

import Link from "next/link";
import { useState } from "react";
import { saveCandidate } from "@/app/candidates/actions";
import type { Candidate, CandidateEducation, CandidateTag, Tag, CandidateWorkExperience, CandidateProject } from "@prisma/client";

type CandidateWithRelations = Candidate & {
  educations: CandidateEducation[];
  workExperiences: CandidateWorkExperience[];
  projects: CandidateProject[];
  tags: (CandidateTag & { tag: Tag })[];
};

type CandidateFormProps = {
  mode: "create" | "edit";
  backHref: string;
  candidate?: CandidateWithRelations;
  viewerId: string;
  viewerRole: string;
  users: { id: string; name: string }[];
  availableTags: Tag[];
};

type EducationInput = {
  schoolName: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  isTopDegree: boolean;
};

type WorkExperienceInput = {
  companyName: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ProjectInput = {
  projectName: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  link: string;
};

export function CandidateForm({ mode, backHref, candidate, viewerId, viewerRole, users, availableTags }: CandidateFormProps) {
  const isEdit = mode === "edit";

  // Use state for dynamic lists (education/work)
  const [educations, setEducations] = useState<EducationInput[]>(
    candidate?.educations.map((e) => ({
      schoolName: e.schoolName,
      degree: e.degree,
      major: e.major ?? "",
      startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : "",
      endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : "",
      isTopDegree: e.isTopDegree,
    })) || [{ schoolName: "", degree: "本科", major: "", startDate: "", endDate: "", isTopDegree: false }]
  );

  const [workExperiences, setWorkExperiences] = useState<WorkExperienceInput[]>(
    candidate?.workExperiences.map((w) => ({
      companyName: w.companyName,
      title: w.title,
      startDate: w.startDate ? new Date(w.startDate).toISOString().slice(0, 10) : "",
      endDate: w.endDate ? new Date(w.endDate).toISOString().slice(0, 10) : "",
      description: w.description ?? "",
    })) || [{ companyName: "", title: "", startDate: "", endDate: "", description: "" }]
  );

  const [projects, setProjects] = useState<ProjectInput[]>(
    candidate?.projects.map((p) => ({
      projectName: p.projectName,
      role: p.role ?? "",
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : "",
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : "",
      description: p.description ?? "",
      link: p.link ?? "",
    })) || [{ projectName: "", role: "", startDate: "", endDate: "", description: "", link: "" }]
  );

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    candidate?.tags?.map((ct) => ct.tagId) ?? [],
  );

  const addEdu = () => setEducations([...educations, { schoolName: "", degree: "本科", major: "", startDate: "", endDate: "", isTopDegree: false }]);
  const addWork = () => setWorkExperiences([...workExperiences, { companyName: "", title: "", startDate: "", endDate: "", description: "" }]);
  const addProj = () => setProjects([...projects, { projectName: "", role: "", startDate: "", endDate: "", description: "", link: "" }]);

  return (
    <form action={saveCandidate} className="page-stack">
      <input type="hidden" name="id" value={candidate?.id} />
      <input type="hidden" name="viewerId" value={viewerId} />
      <input type="hidden" name="viewerRole" value={viewerRole} />

      <section className="page-header">
        <div className="section-header">
          <p className="kicker">{isEdit ? "Edit Candidate" : "Create Candidate"}</p>
          <h1>{isEdit ? `编辑候选人：${candidate?.name ?? ""}` : "新增候选人"}</h1>
          <p className="muted">已接入 Prisma 和真实保存接口。</p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={backHref}>
            返回
          </Link>
          <button className="button-primary" type="submit">
            保存候选人
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>基础信息</h2>
          <p className="muted">姓名、联系方式、来源、当前跟进人等字段直接映射到 `candidates` 表。</p>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field-group">
            <label htmlFor="name">姓名</label>
            <input defaultValue={candidate?.name ?? ""} id="name" name="name" placeholder="请输入候选人姓名" required />
          </div>
          <div className="field-group">
            <label htmlFor="gender">性别</label>
            <select defaultValue={candidate?.gender ?? ""} id="gender" name="gender">
              <option value="">未知</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="birthDate">出生日期</label>
            <input
              type="date"
              defaultValue={candidate?.birthDate ? new Date(candidate.birthDate).toISOString().slice(0, 10) : ""}
              id="birthDate"
              name="birthDate"
            />
          </div>
          <div className="field-group">
            <label htmlFor="email">邮箱</label>
            <input defaultValue={candidate?.email ?? ""} id="email" name="email" placeholder="如：name@example.com" />
          </div>
          <div className="field-group">
            <label htmlFor="phone">手机号</label>
            <input defaultValue={candidate?.phone ?? ""} id="phone" name="phone" placeholder="请输入手机号" />
          </div>
          <div className="field-group">
            <label htmlFor="city">城市</label>
            <input defaultValue={candidate?.city ?? ""} id="city" name="city" placeholder="如：深圳" />
          </div>
          <div className="field-group">
            <label htmlFor="source">来源</label>
            <input defaultValue={candidate?.source ?? ""} id="source" name="source" placeholder="如：Boss 直聘 / 微信" />
          </div>
          <div className="field-group">
            <label htmlFor="company">当前公司</label>
            <input defaultValue={candidate?.currentCompany ?? ""} id="company" name="company" placeholder="请输入当前公司" />
          </div>
          <div className="field-group">
            <label htmlFor="title">当前岗位</label>
            <input defaultValue={candidate?.currentTitle ?? ""} id="title" name="title" placeholder="请输入当前岗位" />
          </div>
          <div className="field-group">
            <label htmlFor="status">状态</label>
            <select defaultValue={candidate?.status ?? "NEW"} id="status" name="status">
              <option value="NEW">NEW</option>
              <option value="FOLLOWING">FOLLOWING</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="followUser">当前跟进人</label>
            <select defaultValue={candidate?.currentFollowUserId ?? ""} id="followUser" name="followUser">
              <option value="">未分配</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group form-span-2">
            <label htmlFor="summary">候选人摘要</label>
            <textarea defaultValue={candidate?.summary ?? ""} id="summary" name="summary" placeholder="填写候选人的亮点、求职意向、薪资预期等" />
          </div>
          <div className="field-group form-span-2">
            <label htmlFor="skills">掌握技能</label>
            <textarea defaultValue={candidate?.skills ?? ""} id="skills" name="skills" placeholder="如：Java、微服务、SaaS、产品增长（建议用逗号/换行分隔）" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>教育经历</h2>
          <p className="muted">支持多段教育经历管理。</p>
        </div>
        <div className="page-stack" style={{ marginTop: 16 }}>
          {educations.map((edu, idx) => (
            <div className="sub-card" key={idx}>
              <div className="form-grid">
                <div className="field-group">
                  <label>学校</label>
                  <input name={`edu_schoolName_${idx}`} defaultValue={edu.schoolName} required />
                </div>
                <div className="field-group">
                  <label>学历</label>
                  <select name={`edu_degree_${idx}`} defaultValue={edu.degree || "本科"}>
                    <option value="大专">大专</option>
                    <option value="专升本">专升本</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>专业</label>
                  <input name={`edu_major_${idx}`} defaultValue={edu.major} />
                </div>
                <div className="field-group">
                  <label>入学日期</label>
                  <input type="date" name={`edu_startDate_${idx}`} defaultValue={edu.startDate} />
                </div>
                <div className="field-group">
                  <label>毕业日期</label>
                  <input type="date" name={`edu_endDate_${idx}`} defaultValue={edu.endDate} />
                </div>
                <div className="field-group">
                  <label>最高学历</label>
                  <input type="checkbox" name={`edu_isTopDegree_${idx}`} defaultChecked={edu.isTopDegree} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEdu} className="button-secondary">
            添加教育经历
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>工作经历</h2>
          <p className="muted">记录候选人的职场历程。</p>
        </div>
        <div className="page-stack" style={{ marginTop: 16 }}>
          {workExperiences.map((work, idx) => (
            <div className="sub-card" key={idx}>
              <div className="form-grid">
                <div className="field-group">
                  <label>公司名称</label>
                  <input name={`work_companyName_${idx}`} defaultValue={work.companyName} required />
                </div>
                <div className="field-group">
                  <label>职位</label>
                  <input name={`work_title_${idx}`} defaultValue={work.title} />
                </div>
                <div className="field-group">
                  <label>开始日期</label>
                  <input type="date" name={`work_startDate_${idx}`} defaultValue={work.startDate} />
                </div>
                <div className="field-group">
                  <label>结束日期</label>
                  <input type="date" name={`work_endDate_${idx}`} defaultValue={work.endDate} />
                </div>
                <div className="field-group form-span-2">
                  <label>工作描述</label>
                  <textarea name={`work_description_${idx}`} defaultValue={work.description} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addWork} className="button-secondary">
            添加工作经历
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>项目经验</h2>
          <p className="muted">记录候选人的项目经历，便于推荐与匹配。</p>
        </div>
        <div className="page-stack" style={{ marginTop: 16 }}>
          {projects.map((proj, idx) => (
            <div className="sub-card" key={idx}>
              <div className="form-grid">
                <div className="field-group">
                  <label>项目名称</label>
                  <input name={`proj_projectName_${idx}`} defaultValue={proj.projectName} required />
                </div>
                <div className="field-group">
                  <label>担任角色</label>
                  <input name={`proj_role_${idx}`} defaultValue={proj.role} />
                </div>
                <div className="field-group">
                  <label>开始日期</label>
                  <input type="date" name={`proj_startDate_${idx}`} defaultValue={proj.startDate} />
                </div>
                <div className="field-group">
                  <label>结束日期</label>
                  <input type="date" name={`proj_endDate_${idx}`} defaultValue={proj.endDate} />
                </div>
                <div className="field-group form-span-2">
                  <label>项目描述</label>
                  <textarea name={`proj_description_${idx}`} defaultValue={proj.description} />
                </div>
                <div className="field-group form-span-2">
                  <label>项目链接</label>
                  <input name={`proj_link_${idx}`} defaultValue={proj.link} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addProj} className="button-secondary">
            添加项目经验
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>标签</h2>
          <p className="muted">用于筛选与匹配，可多选。</p>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field-group form-span-2">
            <label>选择标签</label>
            <div className="badge-row">
              {availableTags.map((tag) => {
                const checked = selectedTagIds.includes(tag.id);
                return (
                  <label key={tag.id} className="badge badge-amber" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTagIds([...selectedTagIds, tag.id]);
                        } else {
                          setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id));
                        }
                      }}
                      style={{ marginRight: 6 }}
                    />
                    {tag.name}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
