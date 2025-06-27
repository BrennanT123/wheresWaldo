import { PrismaClient } from "../../generated/prisma/index.js";
import dotenv from "dotenv";

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

async function fixAllLeaderboardRanks() {
  const leaderboards = await prisma.leaderBoard.findMany();

  for (const lb of leaderboards) {
    const entries = await prisma.leaderBoardEntry.findMany({
      where: { leaderBoardId: lb.id },
      orderBy: { score: "desc" }, // sort descending
    });

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const newRank = i + 1;

      // Only update if rank is wrong to minimize writes
      if (entry.rank !== newRank) {
        await prisma.leaderBoardEntry.update({
          where: { id: entry.id },
          data: { rank: newRank },
        });
      }
    }

    console.log(`Fixed ranks for leaderboard ${lb.id}`);
  }
}

async function main() {
  try {
    await fixAllLeaderboardRanks();
    console.log("✅ All leaderboard ranks corrected.");
  } catch (e) {
    console.error("❌ Error fixing ranks:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
