/*
  Warnings:

  - You are about to drop the `Emotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryEmotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryReflection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_userId_fkey";

-- DropForeignKey
ALTER TABLE "EntryEmotion" DROP CONSTRAINT "EntryEmotion_emotionId_fkey";

-- DropForeignKey
ALTER TABLE "EntryEmotion" DROP CONSTRAINT "EntryEmotion_entryId_fkey";

-- DropForeignKey
ALTER TABLE "EntryReflection" DROP CONSTRAINT "EntryReflection_entryId_fkey";

-- DropTable
DROP TABLE "Emotion";

-- DropTable
DROP TABLE "Entry";

-- DropTable
DROP TABLE "EntryEmotion";

-- DropTable
DROP TABLE "EntryReflection";

-- CreateTable
CREATE TABLE "entries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_emotions" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "emotionId" INTEGER NOT NULL,
    "userSelected" BOOLEAN NOT NULL DEFAULT false,
    "aiDetected" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_reflections" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "advice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entry_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entries_userId_idx" ON "entries"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_name_key" ON "emotions"("name");

-- CreateIndex
CREATE INDEX "entry_emotions_emotionId_idx" ON "entry_emotions"("emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "entry_emotions_entryId_emotionId_key" ON "entry_emotions"("entryId", "emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "entry_reflections_entryId_key" ON "entry_reflections"("entryId");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_emotions" ADD CONSTRAINT "entry_emotions_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_emotions" ADD CONSTRAINT "entry_emotions_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "emotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_reflections" ADD CONSTRAINT "entry_reflections_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
