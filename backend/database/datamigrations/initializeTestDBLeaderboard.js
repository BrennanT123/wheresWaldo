import { PrismaClient } from "../../generated/prisma/index.js";
import dotenv from "dotenv";
import { faker } from '@faker-js/faker';

dotenv.config();

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
async function seedLeaderboardEntries() {
  //fetch all scenes with their leaderboards
  const scenes = await prisma.scene.findMany({
    include: { leaderBoard: true },
  });

  for (const scene of scenes) {
    if (!scene.leaderBoard) {
      console.warn(`Scene ${scene.id} has no leaderboard, skipping.`);
      continue;
    }

    const leaderboardId = scene.leaderBoard.id;

    console.log(`Seeding leaderboard entries for scene ${scene.id}, leaderboard ${leaderboardId}`);

    //create 10 leaderboard entries with faker
    const entriesData = [];

    for (let rank = 1; rank <= 10; rank++) {
      entriesData.push({
        rank,
        playerName: faker.person.firstName() + " " + faker.person.lastName(),
        score: faker.number.int({ min: 0, max: 10000 }),
        leaderBoardId: leaderboardId,
        date: faker.date.recent(30),
      });
    }

    //bulk create the entries
    await prisma.leaderBoardEntry.createMany({
      data: entriesData,
      skipDuplicates: true, //just in case
    });

    console.log(`Created 10 leaderboard entries for leaderboard ${leaderboardId}`);
  }
}

async function main() {
  try {
    await seedLeaderboardEntries();
    console.log("Seeding complete!");
  } catch (e) {
    console.error("Error seeding leaderboard entries:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
