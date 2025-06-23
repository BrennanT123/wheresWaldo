import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient, Prisma } from "./generated/prisma/index.js";
import gameRouter from "./routes/gameFunctionsRouter.js";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";



const app = express();
dotenv.config();


//session setup

//Sessionsetup
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
      secure: process.env.NODE_ENV === "production"
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
}

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
const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});


app.use("/",gameRouter);



// Start the session
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));