-- CreateTable
CREATE TABLE "Scene" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "leaderBoardId" INTEGER NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderBoard" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderBoardEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "leaderBoardId" INTEGER NOT NULL,

    CONSTRAINT "leaderBoardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Characters" (
    "id" SERIAL NOT NULL,
    "xPos" INTEGER NOT NULL,
    "yPos" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "isFound" BOOLEAN NOT NULL DEFAULT false,
    "sceneId" INTEGER NOT NULL,

    CONSTRAINT "Characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentGame" (
    "id" SERIAL NOT NULL,
    "incorrectGuesses" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "sceneId" INTEGER NOT NULL,

    CONSTRAINT "CurrentGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sid" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Enter Name',

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scene_leaderBoardId_key" ON "Scene"("leaderBoardId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentGame_sceneId_key" ON "CurrentGame"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_leaderBoardId_fkey" FOREIGN KEY ("leaderBoardId") REFERENCES "leaderBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderBoardEntry" ADD CONSTRAINT "leaderBoardEntry_leaderBoardId_fkey" FOREIGN KEY ("leaderBoardId") REFERENCES "leaderBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentGame" ADD CONSTRAINT "CurrentGame_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
