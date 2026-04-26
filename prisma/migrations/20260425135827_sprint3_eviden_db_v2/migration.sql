/*
  Warnings:

  - You are about to drop the column `endDate` on the `DokumenEviden` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `DokumenEviden` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DokumenEviden" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "periode" TEXT;
