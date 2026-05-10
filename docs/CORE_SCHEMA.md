# 人才管理系统 V1 核心数据结构设计

## 1. 设计原则

- 以候选人为核心实体。
- 所有关键协作行为都可追踪。
- 简历解析结果既保存结构化字段，也保存原始结果。
- 权限控制以角色和数据可见范围共同决定。
- 为后续智能匹配预留职位、经历、标签等结构化字段。

## 2. 核心实体关系

主要关系如下：

1. 一个用户属于一个角色。
2. 一个候选人可拥有多份简历。
3. 一个候选人可拥有多段教育经历。
4. 一个候选人可拥有多条跟进记录。
5. 一个候选人可绑定多个标签。
6. 一个候选人可拥有多条编辑日志。
7. 一个客户可拥有多个岗位。

## 3. 权限口径

### 3.1 角色定义

- `ADMIN`：管理员
- `ASSISTANT`：猎头助理
- `INTERN`：实习生

### 3.2 候选人可见范围

- `ADMIN`：可查看全部候选人。
- `ASSISTANT`：可查看全部候选人。
- `INTERN`：仅可查看满足以下任一条件的候选人：
  - 自己是当前跟进人。
  - 自己创建了该候选人。
  - 自己在该候选人下新增过跟进记录。

### 3.3 候选人编辑权限

- `ADMIN`：可编辑全部候选人。
- `ASSISTANT`：可编辑全部候选人。
- `INTERN`：默认不可编辑他人候选人基础信息，仅可新增自己的跟进记录。

### 3.4 日志规则

以下操作必须产生日志：

- 新建候选人
- 编辑候选人基础字段
- 修改当前跟进人
- 新增、修改、删除教育经历
- 新增、删除候选人标签
- 上传或替换简历

## 4. 表设计

以下字段名采用英文，便于直接映射 Prisma 和数据库。

### 4.1 `roles`

角色表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| code | varchar(50) | 角色编码，唯一 |
| name | varchar(50) | 角色名称 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.2 `users`

系统用户表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| role_id | uuid | 关联 `roles.id` |
| name | varchar(100) | 用户姓名 |
| email | varchar(255) | 邮箱，可空 |
| phone | varchar(50) | 手机号，可空 |
| password_hash | varchar(255) | 密码哈希 |
| status | varchar(30) | 状态，如 ACTIVE、DISABLED |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.3 `candidates`

候选人主表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| name | varchar(100) | 姓名 |
| gender | varchar(20) | 性别，可空 |
| phone | varchar(50) | 手机号，可空 |
| wechat | varchar(100) | 微信，可空 |
| email | varchar(255) | 邮箱，可空 |
| city | varchar(100) | 城市，可空 |
| current_company | varchar(255) | 当前公司，可空 |
| current_title | varchar(255) | 当前职位，可空 |
| years_of_experience | decimal(5,2) | 总工作年限，可空 |
| source | varchar(100) | 来源，如 BOSS、微信 |
| status | varchar(50) | 候选人状态 |
| summary | text | 简要摘要，可空 |
| current_follow_user_id | uuid | 当前跟进人，关联 `users.id` |
| created_by | uuid | 创建人，关联 `users.id` |
| last_follow_up_at | timestamptz | 最近跟进时间，可空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

#### 说明

- `current_follow_user_id` 用于体现“当前跟进人”。
- `created_by` 用于支持实习生可见范围判断。
- `status` 第一版可枚举为 `NEW`、`FOLLOWING`、`AVAILABLE`、`ON_HOLD`、`ARCHIVED`。

### 4.4 `candidate_educations`

候选人教育经历表，支持一对多。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id` |
| school_name | varchar(255) | 学校名称 |
| degree | varchar(100) | 学历 |
| major | varchar(255) | 专业，可空 |
| start_date | date | 入学时间，可空 |
| end_date | date | 毕业时间，可空 |
| is_top_degree | boolean | 是否最高学历 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.5 `candidate_work_experiences`

候选人工作经历表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id` |
| company_name | varchar(255) | 公司名称 |
| title | varchar(255) | 职位名称 |
| start_date | date | 开始时间，可空 |
| end_date | date | 结束时间，可空 |
| description | text | 工作描述，可空 |
| sort_order | int | 排序，可空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.6 `candidate_resumes`

候选人简历表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id`，首次上传前可空 |
| original_file_name | varchar(255) | 原始文件名 |
| file_path | varchar(500) | 文件存储路径 |
| file_type | varchar(50) | 文件类型 |
| extracted_text | text | 提取后的文本，可空 |
| parser_provider | varchar(100) | 解析服务提供方，可空 |
| parse_status | varchar(50) | 解析状态 |
| parsed_result_json | jsonb | 结构化解析结果，可空 |
| parser_raw_response | jsonb | 原始响应，可空 |
| uploaded_by | uuid | 上传人，关联 `users.id` |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

#### 说明

- `parsed_result_json` 用于保存标准化后的结构化结果。
- `parser_raw_response` 用于保存原始模型输出，便于后续优化 prompt 和解析流程。

### 4.7 `tags`

标签主表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| name | varchar(100) | 标签名称，唯一 |
| color | varchar(30) | 展示颜色，可空 |
| status | varchar(30) | 状态，如 ACTIVE、INACTIVE |
| created_by | uuid | 创建人，关联 `users.id` |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.8 `candidate_tags`

候选人与标签关联表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id` |
| tag_id | uuid | 关联 `tags.id` |
| created_at | timestamptz | 创建时间 |

#### 约束

- 唯一索引：`(candidate_id, tag_id)`

### 4.9 `candidate_follow_ups`

候选人跟进记录表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id` |
| follow_up_user_id | uuid | 跟进人，关联 `users.id` |
| follow_up_type | varchar(50) | 跟进方式 |
| content | text | 跟进内容 |
| next_action | text | 下一步动作，可空 |
| next_follow_up_at | timestamptz | 下次跟进时间，可空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

#### 建议枚举

- `INITIAL_CONTACT`
- `PHONE_CALL`
- `WECHAT`
- `RESUME_RECEIVED`
- `PRE_RECOMMENDATION`
- `NOT_SUITABLE`
- `FOLLOW_LATER`

### 4.10 `candidate_change_logs`

候选人编辑日志表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| candidate_id | uuid | 关联 `candidates.id` |
| actor_user_id | uuid | 操作人，关联 `users.id` |
| action_type | varchar(50) | 操作类型 |
| field_name | varchar(100) | 修改字段名，可空 |
| old_value | text | 修改前，可空 |
| new_value | text | 修改后，可空 |
| metadata | jsonb | 扩展信息，可空 |
| created_at | timestamptz | 创建时间 |

#### 说明

- 单字段变更可直接记录 `field_name`、`old_value`、`new_value`。
- 复杂变更如新增教育经历，可通过 `metadata` 保存详情。

### 4.11 `clients`

客户表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| company_name | varchar(255) | 公司名称 |
| industry | varchar(100) | 行业，可空 |
| city | varchar(100) | 城市，可空 |
| cooperation_status | varchar(50) | 合作状态 |
| priority | varchar(30) | 优先级 |
| owner_user_id | uuid | 负责人，关联 `users.id` |
| notes | text | 备注，可空 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.12 `jobs`

岗位表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| client_id | uuid | 关联 `clients.id` |
| title | varchar(255) | 岗位名称 |
| city | varchar(100) | 城市，可空 |
| salary_range | varchar(100) | 薪资范围，可空 |
| description | text | 岗位描述，可空 |
| requirements | text | 任职要求，可空 |
| priority | varchar(30) | 优先级 |
| status | varchar(50) | 岗位状态 |
| deadline | date | 截止时间，可空 |
| owner_user_id | uuid | 负责人，关联 `users.id` |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### 4.13 `activity_logs`

首页动态流表，可由应用层聚合生成，也可单独落表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| actor_user_id | uuid | 操作人 |
| entity_type | varchar(50) | 实体类型 |
| entity_id | uuid | 实体 ID |
| action | varchar(50) | 行为 |
| summary | varchar(255) | 动态摘要 |
| metadata | jsonb | 扩展信息，可空 |
| created_at | timestamptz | 创建时间 |

## 5. 推荐索引

### 5.1 候选人检索索引

- `candidates(name)`
- `candidates(phone)`
- `candidates(current_company)`
- `candidates(current_title)`
- `candidates(current_follow_user_id)`
- `candidates(last_follow_up_at)`

### 5.2 关联检索索引

- `candidate_educations(candidate_id)`
- `candidate_follow_ups(candidate_id, created_at desc)`
- `candidate_change_logs(candidate_id, created_at desc)`
- `candidate_resumes(candidate_id, created_at desc)`
- `candidate_tags(candidate_id, tag_id)`
- `jobs(client_id, priority, status)`

## 6. Prisma 模型建议

### 6.1 枚举建议

- `UserRoleCode`
- `UserStatus`
- `CandidateStatus`
- `ResumeParseStatus`
- `FollowUpType`
- `PriorityLevel`
- `JobStatus`

### 6.2 关系重点

- `User` 与 `Role` 为多对一。
- `Candidate` 与 `CandidateEducation` 为一对多。
- `Candidate` 与 `CandidateFollowUp` 为一对多。
- `Candidate` 与 `Tag` 通过 `CandidateTag` 为多对多。
- `Candidate` 与 `CandidateChangeLog` 为一对多。
- `Client` 与 `Job` 为一对多。

## 7. 列表与页面映射建议

### 7.1 候选人列表页依赖字段

- `candidates`
- 聚合最新 `candidate_follow_ups`
- 聚合 `candidate_tags`

### 7.2 候选人详情页依赖字段

- `candidates`
- `candidate_educations`
- `candidate_work_experiences`
- `candidate_resumes`
- `candidate_follow_ups`
- `candidate_change_logs`
- `candidate_tags`

### 7.3 管理首页依赖字段

- `candidates`
- `candidate_follow_ups`
- `jobs`
- `activity_logs`

## 8. 开发顺序建议

### 阶段一

- 初始化 Next.js 项目
- 接入 PostgreSQL 和 Prisma
- 建立用户、角色、候选人基础表
- 完成登录与权限中间件

### 阶段二

- 完成候选人列表页和详情页
- 完成教育经历、标签、跟进记录
- 完成候选人编辑日志

### 阶段三

- 完成简历上传
- 完成解析接口封装
- 完成解析结果确认入库流程

### 阶段四

- 完成客户和岗位简版
- 完成管理员看板

## 9. 数据一致性建议

- 新增跟进记录时，同步更新 `candidates.last_follow_up_at`。
- 修改候选人关键字段时，必须同步写入 `candidate_change_logs`。
- 简历解析成功但用户未确认前，先保存到 `candidate_resumes`，不要直接覆盖主表。
- 实习生的可见范围查询建议基于 SQL 条件统一封装，避免前端绕过。
