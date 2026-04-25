-- CreateTable
CREATE TABLE "DokumenEviden" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "indikator" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DokumenEviden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenFile" (
    "id" TEXT NOT NULL,
    "evidenId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "savedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DokumenEviden" ADD CONSTRAINT "DokumenEviden_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenEviden" ADD CONSTRAINT "DokumenEviden_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenFile" ADD CONSTRAINT "EvidenFile_evidenId_fkey" FOREIGN KEY ("evidenId") REFERENCES "DokumenEviden"("id") ON DELETE CASCADE ON UPDATE CASCADE;
