/*
  Warnings:

  - You are about to drop the column `animatedEmoji` on the `emotions` table. All the data in the column will be lost.
  - Added the required column `animatedEmojiUrl` to the `emotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emotions" DROP COLUMN "animatedEmoji",
ADD COLUMN     "animatedEmojiUrl" TEXT NOT NULL;
