"use client";

import Link from "next/link";
import { saveClient } from "@/app/clients/actions";
import type { Client, PriorityLevel } from "@prisma/client";

type ClientFormProps = {
  mode: "create" | "edit";
  backHref: string;
  viewerId: string;
  viewerRole: string;
  users: { id: string; name: string }[];
  client?: Client;
};

const PRIORITIES: { value: PriorityLevel; label: string }[] = [
  { value: "LOW", label: "LOW" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "HIGH", label: "HIGH" },
  { value: "URGENT", label: "URGENT" },
];

export function ClientForm({ mode, backHref, viewerId, viewerRole, users, client }: ClientFormProps) {
  const isEdit = mode === "edit";

  return (
    <form action={saveClient} className="page-stack">
      <input type="hidden" name="id" value={client?.id} />
      <input type="hidden" name="viewerId" value={viewerId} />
      <input type="hidden" name="viewerRole" value={viewerRole} />

      <section className="page-header">
        <div className="section-header">
          <p className="kicker">{isEdit ? "Edit Client" : "Create Client"}</p>
          <h1>{isEdit ? `编辑客户：${client?.companyName ?? ""}` : "新增客户"}</h1>
          <p className="muted">用于管理客户公司信息、合作状态与负责人。</p>
        </div>
        <div className="action-row">
          <Link className="button-secondary" href={backHref}>
            返回
          </Link>
          <button className="button-primary" type="submit">
            保存客户
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>客户信息</h2>
          <p className="muted">MVP 先覆盖客户基础档案与负责人分配。</p>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field-group form-span-2">
            <label htmlFor="companyName">公司名称</label>
            <input id="companyName" name="companyName" defaultValue={client?.companyName ?? ""} required />
          </div>

          <div className="field-group">
            <label htmlFor="industry">行业</label>
            <input id="industry" name="industry" defaultValue={client?.industry ?? ""} placeholder="如：互联网 / SaaS" />
          </div>

          <div className="field-group">
            <label htmlFor="city">城市</label>
            <input id="city" name="city" defaultValue={client?.city ?? ""} placeholder="如：深圳" />
          </div>

          <div className="field-group">
            <label htmlFor="cooperationStatus">合作状态</label>
            <input id="cooperationStatus" name="cooperationStatus" defaultValue={client?.cooperationStatus ?? "待推进"} />
          </div>

          <div className="field-group">
            <label htmlFor="priority">优先级</label>
            <select id="priority" name="priority" defaultValue={client?.priority ?? "MEDIUM"}>
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group form-span-2">
            <label htmlFor="ownerUserId">负责人</label>
            <select id="ownerUserId" name="ownerUserId" defaultValue={client?.ownerUserId ?? viewerId}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group form-span-2">
            <label htmlFor="notes">备注</label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes ?? ""}
              placeholder="记录客户背景、预算、关键联系人、合作进展等"
            />
          </div>
        </div>
      </section>
    </form>
  );
}

