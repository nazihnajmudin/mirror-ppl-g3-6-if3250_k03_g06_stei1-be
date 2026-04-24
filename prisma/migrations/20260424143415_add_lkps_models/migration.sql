-- CreateTable
CREATE TABLE "LKPSCriteria" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "criteriaCode" TEXT NOT NULL,
    "criteriaName" TEXT NOT NULL,
    "subCriteriaCode" TEXT,
    "subCriteriaName" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LKPSCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LKPSSheetData" (
    "id" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "sheetTitle" TEXT,
    "data" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LKPSSheetData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LKPSCriteria_documentId_criteriaCode_subCriteriaCode_key" ON "LKPSCriteria"("documentId", "criteriaCode", "subCriteriaCode");

-- CreateIndex
CREATE UNIQUE INDEX "LKPSSheetData_criteriaId_sheetName_key" ON "LKPSSheetData"("criteriaId", "sheetName");

-- AddForeignKey
ALTER TABLE "LKPSCriteria" ADD CONSTRAINT "LKPSCriteria_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "DocumentLKPS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LKPSSheetData" ADD CONSTRAINT "LKPSSheetData_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "LKPSCriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
