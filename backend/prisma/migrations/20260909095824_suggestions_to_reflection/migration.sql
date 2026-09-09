/*
  Warnings:

  - Made the column `reflection` on table `entry_reflections` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "entry_reflections" ALTER COLUMN "reflection" SET NOT NULL;
