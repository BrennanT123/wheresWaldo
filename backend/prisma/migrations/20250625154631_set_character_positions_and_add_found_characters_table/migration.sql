/*
  Warnings:

  - You are about to drop the column `isFound` on the `Characters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Characters" DROP COLUMN "isFound";

-- CreateTable
CREATE TABLE "CharacterFound" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "currentGameId" INTEGER NOT NULL,

    CONSTRAINT "CharacterFound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CharacterFound" ADD CONSTRAINT "CharacterFound_currentGameId_fkey" FOREIGN KEY ("currentGameId") REFERENCES "CurrentGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
