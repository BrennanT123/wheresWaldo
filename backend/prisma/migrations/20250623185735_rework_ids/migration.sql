/*
  Warnings:

  - You are about to drop the column `data` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sid` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "data",
DROP COLUMN "name",
ADD COLUMN     "sid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");
