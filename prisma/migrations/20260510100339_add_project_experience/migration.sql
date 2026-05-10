-- CreateTable
CREATE TABLE "candidate_projects" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "project_name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "link" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "candidate_projects_candidateId_idx" ON "candidate_projects"("candidateId");

-- AddForeignKey
ALTER TABLE "candidate_projects" ADD CONSTRAINT "candidate_projects_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
