/*
  Warnings:

  - You are about to drop the column `session` on the `CurrentGame` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `CurrentGame` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `CurrentGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrentGame" DROP COLUMN "session",
ADD COLUMN     "sessionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurrentGame_sessionId_key" ON "CurrentGame"("sessionId");

-- AddForeignKey
ALTER TABLE "CurrentGame" ADD CONSTRAINT "CurrentGame_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
