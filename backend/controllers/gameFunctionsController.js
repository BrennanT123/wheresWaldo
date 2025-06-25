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
      where: { sessionId: sessionId },
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

    return res
      .status(200)
      .json({ topFive: topFive, currentGameStats: currentGameStats });
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
    //Used if i am mocknig sessions in a test env

    if (!sessionRecord) {
      let sessionRecord = await prisma.session.create({
        data: {
          sid,
          id: sid,
          data: "{}",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    let currentGame = await prisma.currentGame.findUnique({
      where: {
        sessionId: sid,
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
    console.error(err);
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const postCurrentGame = async (req, res, next) => {
  try {
    let isCurrentGameRunning = await prisma.currentGame.findUnique({
      where: {
        sessionId: req.sessionID,
      },
      include: {
        scene: {
          include: {
            characters: true,
          },
        },
        characterFinds: true,
      },
    });

    if (isCurrentGameRunning) {
      return res.status(200).json({
        currentGame: isCurrentGameRunning,
        gameAlreadyRunning: true,
      });
    } else {
      //we do not set the start time until its done loading
      let currentGame = await prisma.currentGame.create({
        data: {
          sessionId: req.sessionID,
          sceneId: parseInt(req.body.sceneid),
        },
        include: {
          scene: {
            include: {
              characters: true,
            },
          },
          characterFinds: true, 
        },
      });

      return res.status(200).json({
        currentGame: currentGame,
      });
    }
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

//Dont need this anymore since i just pass the scene from the getScenes route on the frontend
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
        sessionId: req.sessionID,
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
        sessionId: req.sessionID,
      },
      include: {
        scene: {
          include: {
            characters: true,
          },
        },
        characterFinds: true,
      },
    });

    if (!currentGame) {
      return res.status(404).json({ error: "Game not found" });
    }

    for (let char of currentGame.scene.characters) {
      if (
        req.body.xcord + 75 >= char.xPos &&
        req.body.xcord - 75 <= char.xPos &&
        req.body.ycord + 75 >= char.yPos &&
        req.body.ycord - 75 <= char.yPos
      ) {
        const alreadyFound = currentGame.characterFinds.some(
          (found) => found.characterId === char.id
        );

        if (alreadyFound) {
          return res.status(200).json({
            correct: true,
            alreadyFound: true,
            characterFound: char.id,
          });
        }

        await prisma.characterFound.create({
          data: {
            characterId: char.id,
            currentGameId: currentGame.id,
          },
        });

        return res.status(200).json({
          correct: true,
          characterFound: char.id,
        });
      }
    }

    await prisma.currentGame.update({
      where: {
        sessionId: req.sessionID,
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
        sessionId: req.sessionID,
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

export const getCheckEndgame = async (req, res, next) => {
  try {
    let currentGame = await prisma.currentGame.findUnique({
      where: {
        sessionId: req.sessionID,
      },
      include: {
        scene: {
          include: {
            characters: true,
          },
        },
        characterFinds: true,
      },
    });

    if (currentGame.characterFinds.length === 3) {
      return res.status(200).json({
        gameOver: true,
      });
    } else if (currentGame.characterFinds.length <= 3) {
      return res.status(200).json({
        gameOver: false,
      });
    } else {
      throw new Error("More than 3 characters listed as found");
    }
  } catch (err) {
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
        sessionId: req.sessionID,
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
          where: { sessionId: sessionId },
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

    const game = await prisma.currentGame.findUnique({
      where: { sessionId },
    });

    if (!game) {
      return res.status(404).json({ errors: [{ message: "No game found" }] });
    }

    await prisma.characterFound.deleteMany({
      where: {
        currentGameId: game.id,
      },
    });

    await prisma.currentGame.delete({
      where: { sessionId: sessionId },
    });

    return res.status(200).json({
      gameDeleted: true,
    });
  } catch (err) {
    if (err.code === "P2025") {
      //prisma error for "record not found"
      return res.status(404).json({ errors: [{ message: "No game found" }] });
    }
    console.error(err);
    return res.status(500).json({
      msg: "Something went wrong.",
      error: err.message,
    });
  }
};

export const getScenes = async (req, res, next) => {
  try {
    const scenes = await prisma.scene.findMany({
      include: { characters: true },
    });
    return res.status(200).json({ scenes });
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
