/*
  Warnings:

  - You are about to drop the column `isDraft` on the `emotions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "emotions" DROP COLUMN "isDraft";

-- AlterTable
ALTER TABLE "entries" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false;
