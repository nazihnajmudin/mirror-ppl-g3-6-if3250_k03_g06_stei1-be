/*
  Warnings:

  - A unique constraint covering the columns `[prodiId,periode,versi]` on the table `DocumentLKPS` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prodiId,periode,template,versi]` on the table `LedForm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DocumentLKPS" ADD COLUMN     "versi" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DokumenEviden" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT,
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "LedForm" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" TEXT,
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "versi" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentLKPS_prodiId_periode_versi_key" ON "DocumentLKPS"("prodiId", "periode", "versi");

-- CreateIndex
CREATE UNIQUE INDEX "LedForm_prodiId_periode_template_versi_key" ON "LedForm"("prodiId", "periode", "template", "versi");
