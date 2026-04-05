-- AlterTable
ALTER TABLE "DocumentLKPS" ADD COLUMN     "periode" TEXT;

-- AlterTable
ALTER TABLE "ProdiAssignment" ADD COLUMN     "kriteria" TEXT[] DEFAULT ARRAY[]::TEXT[];
