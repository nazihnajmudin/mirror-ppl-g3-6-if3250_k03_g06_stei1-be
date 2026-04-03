-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'PIMPINAN', 'KAPRODI', 'TIM_PRODI');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'FINAL');

-- CreateTable
CREATE TABLE "Prodi" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "abbreviation" TEXT,
    "degree" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prodiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "DocumentLKPS" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "name" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentLKPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentLED" (
    "id" TEXT NOT NULL,
    "prodiId" TEXT NOT NULL,
    "name" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "ukuran" INTEGER,
    "periode" TEXT NOT NULL,
    "versi" INTEGER NOT NULL,
    "pengunggahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentLED_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prodi_fullname_key" ON "Prodi"("fullname");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProdiAssignment_userId_prodiId_key" ON "ProdiAssignment"("userId", "prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "AccreditationInfo_prodiId_key" ON "AccreditationInfo"("prodiId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentLED_prodiId_periode_versi_key" ON "DocumentLED"("prodiId", "periode", "versi");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdiAssignment" ADD CONSTRAINT "ProdiAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdiAssignment" ADD CONSTRAINT "ProdiAssignment_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationInfo" ADD CONSTRAINT "AccreditationInfo_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLKPS" ADD CONSTRAINT "DocumentLKPS_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLED" ADD CONSTRAINT "DocumentLED_prodiId_fkey" FOREIGN KEY ("prodiId") REFERENCES "Prodi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLED" ADD CONSTRAINT "DocumentLED_pengunggahId_fkey" FOREIGN KEY ("pengunggahId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
