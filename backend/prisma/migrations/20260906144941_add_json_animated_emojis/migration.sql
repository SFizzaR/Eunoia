/*
  Warnings:

  - You are about to drop the column `emoji` on the `emotions` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `users` table. All the data in the column will be lost.
  - Added the required column `animatedEmoji` to the `emotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `emotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emotions" DROP COLUMN "emoji",
ADD COLUMN     "animatedEmoji" JSONB NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";
