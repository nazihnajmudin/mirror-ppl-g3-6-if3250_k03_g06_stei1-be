-- Add per-prodi support for DataInstitusi
ALTER TABLE "DataInstitusi" ADD COLUMN IF NOT EXISTS "prodiId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'DataInstitusi_periode_sheetName_key'
  ) THEN
    ALTER TABLE "DataInstitusi" DROP CONSTRAINT "DataInstitusi_periode_sheetName_key";
  END IF;
END $$;

ALTER TABLE "DataInstitusi"
  ADD CONSTRAINT "DataInstitusi_prodiId_fkey"
  FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "DataInstitusi_periode_sheetName_prodiId_key"
  ON "DataInstitusi"("periode", "sheetName", "prodiId");

CREATE INDEX IF NOT EXISTS "DataInstitusi_prodiId_idx"
  ON "DataInstitusi"("prodiId");
