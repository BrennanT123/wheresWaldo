import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { validateName } from "../lib/validate.js";

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

export const getLeaderboard = async (req, res, next) => {
  try {

    const sessionId = req.sessionID;
    
    let currentGame = await prisma.currentGame.findUnique({
      where: { sessionSid: sessionId },
      include: {
        scene: {
          include: {
            leaderBoard: {
              include: {
                leaderBoardEntry: true,
              },
            },
          },
        },
      },
    });

    //Probably dont need but keeping it here just incase
    const currentGameStats = req.query.currentGameStats;
    const entries = currentGame.scene.leaderBoard.leaderBoardEntry
      .slice()
      .sort((a, b) => b.score - a.score);

    const topFive = entries.filter((e) => e.rank <= 5);
    


    return res.status(200).json({ topFive: topFive, currentGameStats: currentGameStats });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"

      return res.status(404).json({ errors: [{ message: "No posts found" }] });
    }
    console.log(err);
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

//starts up the current game
export const getStartup = async (req, res, next) => {
  try {
    const sid = req.sessionID;
    let sessionRecord = await prisma.session.findUnique({
      where: { sid },
    });

    //Should not be needed since the prisma session store automatically does this
    //however it was included just to be extra safe
    if (!sessionRecord) {
      let sessionRecord = await prisma.session.create({
        data: {
          sid,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    let currentGame = await prisma.currentGame.findUnique({
      where: {
        sessionSid: sid,
      },
      include: {
        scene: true,
      },
    });

    //if there was no curent game we need to set it up.
    if (!currentGame) {
      return res.status(200).json({ gameRunning: false });
    }

    //if a game was already running then we go to load it
    return res.status(200).json({
      gameRunning: true,
      currentGame: currentGame,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postScene = async (req, res, next) => {
  try {
    let sceneSelected = await prisma.scene.findUnique({
      where: {
        id: req.body.sceneid,
      },
      include: {
        characters: true,
      },
    });
    //we do not set the start time until its done loading
    let currentGame = await prisma.currentGame.create({
      data: {
        sessionSid: req.sessionID,
        sceneId: parseInt(req.body.sceneid),
      },
    });

    return res.status(200).json({
      scene: sceneSelected,
    });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"
      return res.status(404).json({ errors: [{ message: "No scene found" }] });
    }
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postEvaluateGuess = async (req, res, next) => {
  try {
    let currentGame = await prisma.currentGame.findUnique({
      where: {
        sessionSid: req.sessionID,
      },
      include: {
        scene: {
          include: {
            characters: true,
          },
        },
      },
    });

    for (let i = 0; i < currentGame.scene.characters.length; i++) {
      if (
        req.body.xcord + 50 > currentGame.scene.characters[i].xPos &&
        req.body.xcord - 50 < currentGame.scene.characters[i].xPos &&
        req.body.ycord + 50 > currentGame.scene.characters[i].yPos &&
        req.body.ycord - 50 < currentGame.scene.characters[i].yPos
      ) {
        return res.status(200).json({
          correct: true,
          characterFound: currentGame.scene.characters[i].id,
        });
      }
    }
    await prisma.currentGame.update({
      where: {
        sessionSid: req.sessionID,
      },
      data: {
        incorrectGuesses: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      correct: false,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postStartGame = async (req, res, next) => {
  try {
    await prisma.currentGame.update({
      where: {
        sessionSid: req.sessionID,
      },
      data: {
        startTime: new Date(),
      },
    });

    return res.status(200).json({
      gameStarted: true,
    });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"
      return res.status(404).json({ errors: [{ message: "No game found" }] });
    }
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postEndGame = async (req, res, next) => {
  try {
    await prisma.currentGame.update({
      where: {
        sessionSid: req.sessionID,
      },
      data: {
        endTime: new Date(),
      },
    });
    return res.status(200).json({
      gameEnded: true,
    });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"
      return res.status(404).json({ errors: [{ message: "No game found" }] });
    }
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postUpdateLeaderBoard = [
  validateName,
  async (req, res, next) => {
    {
      try {
        const sessionId = req.sessionID;
        let currentGame = await prisma.currentGame.findUnique({
          where: { sessionSid: sessionId },
          include: {
            scene: {
              include: {
                leaderBoard: {
                  include: {
                    leaderBoardEntry: true,
                  },
                },
              },
            },
          },
        });
        console.log("Here");
        let finalScore = 0;
        if (currentGame.endTime && currentGame.startTime) {
          const timeDiffSeconds =
            (currentGame.endTime.getTime() - currentGame.startTime.getTime()) /
            1000;
          finalScore =
            10000 - currentGame.incorrectGuesses * 50 - timeDiffSeconds;
          if (finalScore < 0) finalScore = 0;
        }

        const entries = currentGame.scene.leaderBoard.leaderBoardEntry
          .slice()
          .sort((a, b) => b.score - a.score);

        const betterScores = entries.filter((e) => e.score > finalScore);
        const rank = betterScores.length + 1;
        const worseOrEqualScores = entries.filter((e) => e.score <= finalScore);
        const idsToUpdate = worseOrEqualScores.map((e) => e.id);

        const lowerScoreEntriesIds = await prisma.leaderBoardEntry.updateMany({
          where: {
            id: { in: idsToUpdate },
          },
          data: {
            rank: {
              increment: 1,
            },
          },
        });

        await prisma.leaderBoardEntry.create({
          data: {
            rank: rank,
            playerName: req.body.playerName,
            score: finalScore,
            leaderBoardId: currentGame.scene.leaderBoard.id,
          },
        });

        return res.status(200).json({ rank });
      } catch (err) {
        console.log(err);
        if (err.code === "P2025") {
          //prisma error for "record not found"
          return res
            .status(404)
            .json({ errors: [{ message: "No game found" }] });
        }
        return res.status(500).json({
          msg: "Something went wrong.",
          error: err.message,
        });
      }
    }
  },
];

export const deleteCurrentGame = async (req, res, next) => {
  try {
    const sessionId = req.sessionID;
    await prisma.currentGame.delete({
      where: { sessionSid: sessionId },
    });

    return res.status(200).json({
      gameDeleted: true,
    });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"
      return res.status(404).json({ errors: [{ message: "No game found" }] });
    }
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};
