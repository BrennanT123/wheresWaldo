import request from "supertest";
import express from "express";

/**
 * 
 * The following code was used to confirm that the tests work. Uncomment and check if tests break. 
import index from "../routes/testSetupRouter";
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

test("index route works", done => {
  request(app)
    .get("/")
    .expect("Content-Type", /json/)
    .expect({ name: "frodo" })
    .expect(200, done);
});

test("testing route works", done => {
  request(app)
    .post("/test")
    .type("form")
    .send({ item: "hey" })
    .then(() => {
      request(app)
        .get("/test")
        .expect({ array: ["hey"] }, done);
    });
});

 */

import gameRouter from "../routes/gameFunctionsRouter";

const app = express();
// JSON parsing middleware
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  req.sessionID = "test-session-id"; // mock a session ID
  next();
});

app.use("/", gameRouter);

// test("evaluate getStartup with no current game", (done) => {
//   request(app)
//     .get("/setup")
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .expect((res) => {
//       if (res.body.gameRunning !== false) {
//         throw new Error("Expected gameRunning to be false");
//       }
//     })
//     .end(done);
// });

// test("evaluate getStartup with current game", (done) => {
//   request(app)
//     .get("/setup")
//     .expect("Content-Type", /json/)
//     .expect(200)
//     .expect((res) => {
//       if (res.body.gameRunning !== true) {
//         throw new Error("Expected gameRunning to be true");
//       }
//     })
//     .end(done);
// });

// test("evaluate get scene to setup the scene for the game", (done) => {
//   request(app)
//     .post("/postScene")
//     .send({ sceneid: 1 })
//     .expect("Content-Type", /json/)
//     .expect(200, done);
// });

// test("evaulate guess route works", (done) => {
//   request(app)
//     .post("/evaluateGuess")
//     .send({ xcord: 0, ycord: 0 })
//     .expect(200)
//     .expect("Content-Type", /json/)
//     .expect((res) => {
//       if (typeof res.body.correct !== "boolean") {
//         throw new Error("expected boolean correct type");
//       }
//     })
//     .expect((res) => {
//       if (res.body.correct !== true) {
//         throw new Error("expected correct guess");
//       }
//     })
//     .end((err, res) => {
//       if (err) {
//         console.error("test failed with errro:", err.error);
//         return done(err);
//       }
//       done();
//     });
// });

// test("start game" , (done) =>
// {
//   request(app)
//   .post("/startGame")
//   .expect(200,done);
// })

// test("end game" , (done) =>
// {
//   request(app)
//   .post("/endGame")
//   .expect(200,done);
// })

// test("update leaderboard", (done) => {
//   request(app)
//     .post("/updateLeaderboard")
//     .send({playerName: "test ranking"})
//     .expect(200)
//     .expect((res) => {
//       if (!res.body.rank) {
//         throw new Error("rank missing");
//       }
//     }).end(done);
// });

// test("delete current game", (done) => {
//   request(app)
//   .delete("/deleteCurrentGame")
//   .expect(200,done);
// })

// test("test get leaderboard", (done) => {
//   request(app)
//     .get("/leaderboard")
//     .query({ currentGameStats: 12 })
//     .expect(200)
//     .expect((res) => {
//       if (res.body.topFive.length !== 5) {
//         throw new Error("expected top 5 games to be length 5");
//       }
//       if (res.body.currentGameStats !== "12") {
//         throw new Error("Expected current game stats to be returned identical");
//       }
//     })
//     .end(done);
// });
