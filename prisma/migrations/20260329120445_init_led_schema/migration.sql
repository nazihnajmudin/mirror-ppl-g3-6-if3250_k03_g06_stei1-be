-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "DokumenLED" (
    "id" SERIAL NOT NULL,
    "namaFile" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "ukuran" INTEGER NOT NULL,
    "periode" TEXT NOT NULL,
    "versi" INTEGER NOT NULL,
    "prodiId" INTEGER NOT NULL,
    "pengunggahId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DokumenLED_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DokumenLED_prodiId_periode_versi_key" ON "DokumenLED"("prodiId", "periode", "versi");

-- AddForeignKey
ALTER TABLE "DokumenLED" ADD CONSTRAINT "DokumenLED_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumenLED" ADD CONSTRAINT "DokumenLED_pengunggahId_fkey" FOREIGN KEY ("pengunggahId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
