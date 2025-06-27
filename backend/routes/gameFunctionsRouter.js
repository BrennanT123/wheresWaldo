import express from "express";
import * as gameCtrl from "../controllers/gameFunctionsController.js";

const gameRouter = express.Router();

gameRouter.get("/leaderboard", gameCtrl.getLeaderboard);

gameRouter.post("/evaluateGuess", gameCtrl.postEvaluateGuess);
gameRouter.get("/setup", gameCtrl.getStartup);
gameRouter.get("/getScenes", gameCtrl.getScenes);
gameRouter.post("/postScene", gameCtrl.postScene);
gameRouter.post("/postCurrentGame", gameCtrl.postCurrentGame);

gameRouter.post("/startGame", gameCtrl.postStartGame);
gameRouter.post("/endGame", gameCtrl.postEndGame);
gameRouter.post("/updateLeaderboard", gameCtrl.postUpdateLeaderBoard);
gameRouter.delete("/deleteCurrentGame", gameCtrl.deleteCurrentGame);
gameRouter.get("/checkEndgame", gameCtrl.getCheckEndgame);
gameRouter.get("/api/test-session", (req, res) => {
  if (!req.session.views) req.session.views = 0;
  req.session.views++;
  req.session.test = "force save";

  req.session.test = "cookie-test";
  req.session.save(() => {
    res.send("Session created");
  });
});

gameRouter.get("/test-cookie", (req, res) => {
  res.cookie("manual-test-cookie", "12345", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // or "lax" in local
  });
  res.send("Cookie sent");
});

export default gameRouter;
