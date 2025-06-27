import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient, Prisma } from "./generated/prisma/index.js";
import gameRouter from "./routes/gameFunctionsRouter.js";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

//Railway db setup

import { execSync } from "child_process";

try {
  if (process.env.NODE_ENV === "production") {
    console.log("Running Prisma migration at runtime...");

    if (
      process.env.RAILWAY_STATIC_URL ||
      process.env.NODE_ENV === "production"
    ) {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
    }
  }
} catch (e) {
  console.error("Prisma migration failed:", e);
}

app.use(cookieParser());
//session setup

//Sessionsetup
app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

//Setup to allow API to get calls from the frontend

const corsOptions = {
  origin: process.env.FRONTEND_URL, //youll need to update this when you host your website
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

//For preflight conditions
//This is necessary for requests other than simple requests like
// get, post or head such as delete or put.
//app.options("*",cors(corsOptions));

// JSON parsing middleware
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

//To determine if environment is test environment and what db to use
const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", gameRouter);

//to help debut 404

app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not Found" });
});

// Start the session
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
