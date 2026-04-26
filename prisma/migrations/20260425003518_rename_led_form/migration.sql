/*
  Warnings:

  - You are about to drop the `LEDForm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LEDForm" DROP CONSTRAINT "LEDForm_createdById_fkey";

-- DropForeignKey
ALTER TABLE "LEDForm" DROP CONSTRAINT "LEDForm_prodiId_fkey";

-- DropTable
DROP TABLE "LEDForm";

-- CreateTable
CREATE TABLE "LedForm" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "template" "Template" NOT NULL,
    "periode" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LedForm" ADD CONSTRAINT "LedForm_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedForm" ADD CONSTRAINT "LedForm_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
