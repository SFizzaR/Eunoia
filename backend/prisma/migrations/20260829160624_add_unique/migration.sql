/*
  Warnings:

  - A unique constraint covering the columns `[entryId,fileName]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attachments_entryId_fileName_key" ON "attachments"("entryId", "fileName");
