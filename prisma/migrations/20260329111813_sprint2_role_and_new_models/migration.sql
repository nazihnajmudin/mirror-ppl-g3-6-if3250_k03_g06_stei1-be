/*
  Warnings:

  - The values [ADMIN_INSTITUSI,ADMIN_PRODI,DOSEN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Prodi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `akreditasi` on the `Prodi` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Prodi` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[fullname]` on the table `Prodi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullname` to the `Prodi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LKPS', 'LED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'FINAL');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'PIMPINAN', 'KAPRODI', 'TIM_PRODI');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_prodiId_fkey";

-- DropIndex
DROP INDEX "Prodi_nama_key";

-- AlterTable
ALTER TABLE "Prodi" DROP CONSTRAINT "Prodi_pkey",
DROP COLUMN "akreditasi",
DROP COLUMN "nama",
ADD COLUMN     "abbreviation" TEXT,
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "fullname" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Prodi_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "prodiId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "ProdiAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdiAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationInfo" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "grade" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccreditationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "content" JSONB,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProdiAssignment_userId_prodiId_key" ON "ProdiAssignment"("userId", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationInfo_prodiId_key" ON "AccreditationInfo"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_fullname_key" ON "Prodi"("fullname");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdiAssignment" ADD CONSTRAINT "ProdiAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdiAssignment" ADD CONSTRAINT "ProdiAssignment_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationInfo" ADD CONSTRAINT "AccreditationInfo_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
