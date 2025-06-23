/*
  Warnings:

  - You are about to drop the `leaderBoard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leaderBoardEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_leaderBoardId_fkey";

-- DropForeignKey
ALTER TABLE "leaderBoardEntry" DROP CONSTRAINT "leaderBoardEntry_leaderBoardId_fkey";

-- DropTable
DROP TABLE "leaderBoard";

-- DropTable
DROP TABLE "leaderBoardEntry";

-- CreateTable
CREATE TABLE "LeaderBoard" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderBoardEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "leaderBoardId" INTEGER NOT NULL,

    CONSTRAINT "LeaderBoardEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_leaderBoardId_fkey" FOREIGN KEY ("leaderBoardId") REFERENCES "LeaderBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderBoardEntry" ADD CONSTRAINT "LeaderBoardEntry_leaderBoardId_fkey" FOREIGN KEY ("leaderBoardId") REFERENCES "LeaderBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
