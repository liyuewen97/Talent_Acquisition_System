-- CreateEnum
CREATE TYPE "UserRoleCode" AS ENUM ('ADMIN', 'ASSISTANT', 'INTERN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('NEW', 'FOLLOWING', 'AVAILABLE', 'ON_HOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResumeParseStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('INITIAL_CONTACT', 'PHONE_CALL', 'WECHAT', 'RESUME_RECEIVED', 'PRE_RECOMMENDATION', 'NOT_SUITABLE', 'FOLLOW_LATER');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'PAUSED', 'CLOSED');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" "UserRoleCode" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "phone" VARCHAR(50),
    "wechat" VARCHAR(100),
    "email" VARCHAR(255),
    "city" VARCHAR(100),
    "current_company" VARCHAR(255),
    "current_title" VARCHAR(255),
    "years_of_experience" DECIMAL(5,2),
    "source" VARCHAR(100),
    "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
    "summary" TEXT,
    "current_follow_user_id" UUID,
    "created_by" UUID NOT NULL,
    "last_follow_up_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_educations" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "school_name" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(100) NOT NULL,
    "major" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "is_top_degree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_work_experiences" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "sort_order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_resumes" (
    "id" UUID NOT NULL,
    "candidate_id" UUID,
    "original_file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "extracted_text" TEXT,
    "parser_provider" VARCHAR(100),
    "parse_status" "ResumeParseStatus" NOT NULL DEFAULT 'PENDING',
    "parsed_result_json" JSONB,
    "parser_raw_response" JSONB,
    "uploaded_by" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(30),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "created_by" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_tags" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_follow_ups" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "follow_up_user_id" UUID NOT NULL,
    "follow_up_type" "FollowUpType" NOT NULL,
    "content" TEXT NOT NULL,
    "next_action" TEXT,
    "next_follow_up_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_change_logs" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "field_name" VARCHAR(100),
    "old_value" TEXT,
    "new_value" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100),
    "city" VARCHAR(100),
    "cooperation_status" VARCHAR(50) NOT NULL,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "owner_user_id" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100),
    "salary_range" VARCHAR(100),
    "description" TEXT,
    "requirements" TEXT,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "deadline" DATE,
    "owner_user_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "summary" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "candidates_name_idx" ON "candidates"("name");

-- CreateIndex
CREATE INDEX "candidates_phone_idx" ON "candidates"("phone");

-- CreateIndex
CREATE INDEX "candidates_current_company_idx" ON "candidates"("current_company");

-- CreateIndex
CREATE INDEX "candidates_current_title_idx" ON "candidates"("current_title");

-- CreateIndex
CREATE INDEX "candidates_current_follow_user_id_idx" ON "candidates"("current_follow_user_id");

-- CreateIndex
CREATE INDEX "candidates_last_follow_up_at_idx" ON "candidates"("last_follow_up_at");

-- CreateIndex
CREATE INDEX "candidate_educations_candidateId_idx" ON "candidate_educations"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_work_experiences_candidateId_idx" ON "candidate_work_experiences"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_resumes_candidate_id_idx" ON "candidate_resumes"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "candidate_tags_candidateId_idx" ON "candidate_tags"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_tags_tagId_idx" ON "candidate_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_tags_candidateId_tagId_key" ON "candidate_tags"("candidateId", "tagId");

-- CreateIndex
CREATE INDEX "candidate_follow_ups_candidateId_createdAt_idx" ON "candidate_follow_ups"("candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "candidate_follow_ups_follow_up_user_id_idx" ON "candidate_follow_ups"("follow_up_user_id");

-- CreateIndex
CREATE INDEX "candidate_change_logs_candidateId_createdAt_idx" ON "candidate_change_logs"("candidateId", "createdAt");

-- CreateIndex
CREATE INDEX "candidate_change_logs_actor_user_id_idx" ON "candidate_change_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "clients_owner_user_id_idx" ON "clients"("owner_user_id");

-- CreateIndex
CREATE INDEX "jobs_clientId_idx" ON "jobs"("clientId");

-- CreateIndex
CREATE INDEX "jobs_owner_user_id_idx" ON "jobs"("owner_user_id");

-- CreateIndex
CREATE INDEX "jobs_priority_status_idx" ON "jobs"("priority", "status");

-- CreateIndex
CREATE INDEX "activity_logs_actor_user_id_idx" ON "activity_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_current_follow_user_id_fkey" FOREIGN KEY ("current_follow_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_educations" ADD CONSTRAINT "candidate_educations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_work_experiences" ADD CONSTRAINT "candidate_work_experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_resumes" ADD CONSTRAINT "candidate_resumes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_resumes" ADD CONSTRAINT "candidate_resumes_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_follow_ups" ADD CONSTRAINT "candidate_follow_ups_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_follow_ups" ADD CONSTRAINT "candidate_follow_ups_follow_up_user_id_fkey" FOREIGN KEY ("follow_up_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_change_logs" ADD CONSTRAINT "candidate_change_logs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_change_logs" ADD CONSTRAINT "candidate_change_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
