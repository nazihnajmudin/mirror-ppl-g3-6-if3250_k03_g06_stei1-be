-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'DANGER');

-- DropForeignKey
ALTER TABLE "AccreditationSimulation" DROP CONSTRAINT "AccreditationSimulation_prodiId_fkey";

-- AlterTable
ALTER TABLE "AccreditationSimulation" ALTER COLUMN "indicators" SET NOT NULL,
ALTER COLUMN "quantitativeScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "qualitativeScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalScore" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "targetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThresholdConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThresholdConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThresholdConfig_name_key" ON "ThresholdConfig"("name");

-- AddForeignKey
ALTER TABLE "AccreditationSimulation" ADD CONSTRAINT "AccreditationSimulation_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;