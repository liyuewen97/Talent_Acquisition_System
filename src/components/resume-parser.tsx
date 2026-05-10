"use client";

import { useState } from "react";
import { parseResume, saveCandidate } from "@/app/candidates/actions";

export function ResumeParser({ viewerId, viewerRole }: { viewerId: string; viewerRole: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleParse = async () => {
    if (!text.trim() && !file) return;
    setIsParsing(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("text", text);

      const data = await parseResume(formData);
      setResult(data);
    } catch (error: any) {
      alert(error.message || "解析失败");
    } finally {
      setIsParsing(false);
    }
  };

  const addEdu = () => {
    setResult({
      ...result,
      educations: [...(result.educations || []), { schoolName: "", degree: "本科", major: "", startDate: "", endDate: "" }]
    });
  };

  const addWork = () => {
    setResult({
      ...result,
      workExperiences: [...(result.workExperiences || []), { companyName: "", title: "", startDate: "", endDate: "", description: "" }]
    });
  };

  const addProj = () => {
    setResult({
      ...result,
      projects: [...(result.projects || []), { projectName: "", role: "", startDate: "", endDate: "", description: "", link: "" }]
    });
  };

  const skillsText = Array.isArray(result?.skills) ? result.skills.join("、") : result?.skills || "";

  return (
    <section className="page-stack">
      <article className="card">
        <div className="section-header">
          <h2>上传与解析</h2>
          <p className="muted">支持上传 PDF / DOCX 简历或直接粘贴文本。</p>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field-group form-span-2">
            <label htmlFor="resumeFile">上传简历文件 (PDF / DOCX)</label>
            <input
              type="file"
              id="resumeFile"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file-input"
            />
          </div>
          {!file && (
            <div className="field-group form-span-2">
              <label htmlFor="resumeText">或者粘贴简历文本</label>
              <textarea
                id="resumeText"
                style={{ height: 240 }}
                placeholder="在此粘贴简历文本内容..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="action-row" style={{ marginTop: 16 }}>
          <button
            className="button-primary"
            type="button"
            onClick={handleParse}
            disabled={isParsing || (!text.trim() && !file)}
          >
            {isParsing ? "Agent 正在深度解析中..." : "开始智能解析"}
          </button>
        </div>
      </article>

      {result ? (
        <div className="split-layout">
          <div className="split-layout-left">
            <article className="card">
              <div className="section-header">
                <h2>原始解析文本</h2>
                <p className="muted">左侧为提取原文，右侧为结构化录入表，可左右对照修正。</p>
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 12,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  color: "#444",
                  border: "1px solid #eee"
                }}
              >
                {result.rawText}
              </div>
            </article>
          </div>

          <div className="split-layout-right">
            <form action={saveCandidate} className="page-stack">
              <input type="hidden" name="viewerId" value={viewerId} />
              <input type="hidden" name="viewerRole" value={viewerRole} />
              <input type="hidden" name="status" value="NEW" />

              <article className="card">
                <div className="section-header">
                  <h2>基础信息</h2>
                  <p className="muted">请核对并完善 Agent 提取的信息。</p>
                </div>
                <div className="form-grid" style={{ marginTop: 16 }}>
                  <div className="field-group">
                    <label>姓名</label>
                    <input name="name" defaultValue={result.name} required />
                  </div>
                  <div className="field-group">
                    <label>性别</label>
                    <select name="gender" defaultValue={result.gender || ""}>
                      <option value="">未知</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>出生日期</label>
                    <input type="date" name="birthDate" defaultValue={result.birthDate || ""} />
                  </div>
                  <div className="field-group">
                    <label>邮箱</label>
                    <input name="email" defaultValue={result.email || ""} />
                  </div>
                  <div className="field-group">
                    <label>手机号</label>
                    <input name="phone" defaultValue={result.phone} />
                  </div>
                  <div className="field-group">
                    <label>城市</label>
                    <input name="city" defaultValue={result.city} />
                  </div>
                  <div className="field-group">
                    <label>来源</label>
                    <input name="source" defaultValue="AI 解析" />
                  </div>
                  <div className="field-group">
                    <label>当前公司</label>
                    <input name="company" defaultValue={result.currentCompany} />
                  </div>
                  <div className="field-group">
                    <label>当前职位</label>
                    <input name="title" defaultValue={result.currentTitle} />
                  </div>
                  <div className="field-group form-span-2">
                    <label>个人亮点/自我评价</label>
                    <textarea name="summary" defaultValue={result.summary} />
                  </div>
                </div>
              </article>

              <article className="card">
                <div className="section-header">
                  <h2>教育经历</h2>
                  <button type="button" onClick={addEdu} className="button-link">
                    + 添加教育经历
                  </button>
                </div>
                <div className="page-stack" style={{ marginTop: 16 }}>
                  {result.educations?.map((edu: any, idx: number) => (
                    <div className="sub-card" key={`edu-${idx}`}>
                      <div className="form-grid">
                        <div className="field-group">
                          <label>学校</label>
                          <input name={`edu_schoolName_${idx}`} defaultValue={edu.schoolName} />
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
                          <label>开始日期</label>
                          <input type="date" name={`edu_startDate_${idx}`} defaultValue={edu.startDate} />
                        </div>
                        <div className="field-group">
                          <label>结束日期</label>
                          <input type="date" name={`edu_endDate_${idx}`} defaultValue={edu.endDate} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card">
                <div className="section-header">
                  <h2>工作经历</h2>
                  <button type="button" onClick={addWork} className="button-link">
                    + 添加工作经历
                  </button>
                </div>
                <div className="page-stack" style={{ marginTop: 16 }}>
                  {result.workExperiences?.map((work: any, idx: number) => (
                    <div className="sub-card" key={`work-${idx}`}>
                      <div className="form-grid">
                        <div className="field-group">
                          <label>公司名称</label>
                          <input name={`work_companyName_${idx}`} defaultValue={work.companyName} />
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
                          <label>职责描述</label>
                          <textarea name={`work_description_${idx}`} defaultValue={work.description} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card">
                <div className="section-header">
                  <h2>项目经验</h2>
                  <button type="button" onClick={addProj} className="button-link">
                    + 添加项目经验
                  </button>
                </div>
                <div className="page-stack" style={{ marginTop: 16 }}>
                  {result.projects?.map((proj: any, idx: number) => (
                    <div className="sub-card" key={`proj-${idx}`}>
                      <div className="form-grid">
                        <div className="field-group">
                          <label>项目名称</label>
                          <input name={`proj_projectName_${idx}`} defaultValue={proj.projectName} />
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
                </div>
              </article>

              <article className="card">
                <div className="section-header">
                  <h2>掌握技能</h2>
                  <p className="muted">支持手动补充技能关键词，便于后续检索与匹配。</p>
                </div>
                <div className="field-group" style={{ marginTop: 16 }}>
                  <label>技能列表</label>
                  <textarea name="skills" defaultValue={skillsText} placeholder="建议用逗号/换行分隔" />
                </div>
              </article>

              <div className="action-row" style={{ paddingBottom: 40 }}>
                <button className="button-primary" type="submit" style={{ width: "100%", height: 50 }}>
                  确认并导入候选人库
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <article className="card">
          <div className="section-header">
            <h2>解析结果草稿</h2>
            <p className="muted">解析完成后会展示左右对照的录入界面。</p>
          </div>
          <div className="empty-state" style={{ marginTop: 16 }}>
            {isParsing ? "Agent 正在深度分析文本中..." : "请先上传简历并点击解析。"}
          </div>
        </article>
      )}
    </section>
  );
}
