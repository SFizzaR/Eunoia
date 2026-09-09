/*
  Warnings:

  - You are about to drop the column `summary` on the `entry_reflections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "entry_reflections" DROP COLUMN "summary",
ADD COLUMN     "reflection" TEXT;
