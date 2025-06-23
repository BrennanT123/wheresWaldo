import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

async function getLeaderboards() {
  const leaderboards = await prisma.leaderBoard.findMany({
    include: { leaderBoardEntry: true },
  });
  
  for (let j = 0; j < leaderboards.length; j++) {
      console.log("Start leaderboard");
      const board = leaderboards[j];
      const sortedEntries = board.leaderBoardEntry.sort((a,b) => a.rank -b.rank);
      console.log(`Leaderboard for scene ${j+1}`);
      for(let i = 0; i < sortedEntries.length; i ++)
      {
        console.log(`${sortedEntries[i].playerName} scored ${sortedEntries[i].score} ranking ${sortedEntries[i].rank} on ${sortedEntries[i].date}` )
      }
      console.log(`--------------------------`);
}
}
async function main() {
  try {
    await getLeaderboards();

    console.log("done");
  } catch (e) {
    console.error("Error loading leaderboard entries:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
