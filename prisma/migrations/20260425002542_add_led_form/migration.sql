-- CreateEnum
CREATE TYPE "Template" AS ENUM ('INFOKOM', 'LAM_TEKNIK');

-- CreateTable
CREATE TABLE "LEDForm" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "template" "Template" NOT NULL,
    "periode" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LEDForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LEDForm" ADD CONSTRAINT "LEDForm_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LEDForm" ADD CONSTRAINT "LEDForm_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
