/*
  Warnings:

  - You are about to drop the column `sessionId` on the `CurrentGame` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionSid]` on the table `CurrentGame` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionSid` to the `CurrentGame` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CurrentGame" DROP CONSTRAINT "CurrentGame_sessionId_fkey";

-- DropIndex
DROP INDEX "CurrentGame_sessionId_key";

-- DropIndex
DROP INDEX "Session_sid_key";

-- AlterTable
ALTER TABLE "CurrentGame" DROP COLUMN "sessionId",
ADD COLUMN     "sessionSid" TEXT NOT NULL,
ALTER COLUMN "incorrectGuesses" SET DEFAULT 0,
ALTER COLUMN "score" SET DEFAULT 10000;

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("sid");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentGame_sessionSid_key" ON "CurrentGame"("sessionSid");

-- AddForeignKey
ALTER TABLE "CurrentGame" ADD CONSTRAINT "CurrentGame_sessionSid_fkey" FOREIGN KEY ("sessionSid") REFERENCES "Session"("sid") ON DELETE RESTRICT ON UPDATE CASCADE;
