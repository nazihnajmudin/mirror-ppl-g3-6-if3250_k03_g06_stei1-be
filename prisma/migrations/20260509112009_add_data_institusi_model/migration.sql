-- CreateTable
CREATE TABLE "DataInstitusi" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataInstitusi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataInstitusi_periode_sheetName_key" ON "DataInstitusi"("periode", "sheetName");

-- AddForeignKey
ALTER TABLE "DataInstitusi" ADD CONSTRAINT "DataInstitusi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
