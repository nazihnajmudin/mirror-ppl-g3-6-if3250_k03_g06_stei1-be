-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_INSTITUSI', 'PIMPINAN', 'KAPRODI', 'ADMIN_PRODI', 'DOSEN');

-- CreateTable
CREATE TABLE "Prodi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "akreditasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "prodiId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_nama_key" ON "Prodi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
