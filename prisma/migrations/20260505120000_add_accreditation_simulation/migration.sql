CREATE TABLE "AccreditationSimulation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "prodiId" TEXT NOT NULL UNIQUE,
  "indicators" JSONB,
  "quantitativeScore" REAL NOT NULL DEFAULT 0,
  "qualitativeScore" REAL NOT NULL DEFAULT 0,
  "totalScore" REAL NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

ALTER TABLE "AccreditationSimulation"
  ADD CONSTRAINT "AccreditationSimulation_prodiId_fkey"
  FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE CASCADE;
