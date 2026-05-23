-- CreateEnum
CREATE TYPE "MonitoringDocumentType" AS ENUM ('LKPS', 'LED', 'EVIDEN');

-- CreateEnum
CREATE TYPE "MonitoringStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "MonitoringEvaluation" (
    "id" TEXT NOT NULL,
    "documentType" "MonitoringDocumentType" NOT NULL,
    "documentRefId" TEXT NOT NULL,
    "documentLabel" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "indicatorCode" TEXT,
    "indicatorName" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "evaluation" TEXT,
    "recommendation" TEXT,
    "status" "MonitoringStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "lkpsId" TEXT,
    "ledId" TEXT,
    "evidenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringEvaluation_documentType_documentRefId_idx" ON "MonitoringEvaluation"("documentType", "documentRefId");

-- CreateIndex
CREATE INDEX "MonitoringEvaluation_createdById_idx" ON "MonitoringEvaluation"("createdById");

-- CreateIndex
CREATE INDEX "MonitoringEvaluation_prodiId_idx" ON "MonitoringEvaluation"("prodiId");

-- AddForeignKey
ALTER TABLE "MonitoringEvaluation" ADD CONSTRAINT "MonitoringEvaluation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringEvaluation" ADD CONSTRAINT "MonitoringEvaluation_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringEvaluation" ADD CONSTRAINT "MonitoringEvaluation_lkpsId_fkey" FOREIGN KEY ("lkpsId") REFERENCES "DocumentLKPS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringEvaluation" ADD CONSTRAINT "MonitoringEvaluation_ledId_fkey" FOREIGN KEY ("ledId") REFERENCES "DocumentLED"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringEvaluation" ADD CONSTRAINT "MonitoringEvaluation_evidenId_fkey" FOREIGN KEY ("evidenId") REFERENCES "DokumenEviden"("id") ON DELETE CASCADE ON UPDATE CASCADE;
