import express from "express"
import * as gameCtrl from "../controllers/gameFunctionsController.js"

const gameRouter = express.Router();

gameRouter.get("/leaderboard", gameCtrl.getLeaderboard);

gameRouter.post("/evaluateGuess",gameCtrl.postEvaluateGuess);
gameRouter.get("/setup", gameCtrl.getStartup);
gameRouter.get("/getScenes",gameCtrl.getScenes);
gameRouter.post("/postScene",gameCtrl.postScene);
gameRouter.post("/postCurrentGame",gameCtrl.postCurrentGame);

gameRouter.post("/startGame",gameCtrl.postStartGame);
gameRouter.post("/endGame",gameCtrl.postEndGame);
gameRouter.post("/updateLeaderboard",gameCtrl.postUpdateLeaderBoard);
gameRouter.delete("/deleteCurrentGame",gameCtrl.deleteCurrentGame);
gameRouter.get("/checkEndgame",gameCtrl.getCheckEndgame);

export default gameRouter;