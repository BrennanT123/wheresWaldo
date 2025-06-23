import express from "express"
import * as gameCtrl from "../controllers/gameFunctionsController.js"

const gameRouter = express.Router();

gameRouter.get("/leaderboard", gameCtrl.getLeaderboard);

gameRouter.post("/evaluateGuess",gameCtrl.postEvaluateGuess);
gameRouter.get("/setup", gameCtrl.getStartup);
gameRouter.get("/getScenes",gameCtrl.getScenes);
gameRouter.post("/postScene",gameCtrl.postScene);
gameRouter.post("/startGame",gameCtrl.postStartGame);
gameRouter.post("/endGame",gameCtrl.postEndGame);
gameRouter.post("/updateLeaderboard",gameCtrl.postUpdateLeaderBoard);
gameRouter.post("/endGame",gameCtrl.postEndGame);
gameRouter.delete("/deleteCurrentGame",gameCtrl.deleteCurrentGame);
export default gameRouter;