import { PrismaClient } from "../../generated/prisma/index.js";
import dotenv from "dotenv";

dotenv.config();

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

// Reusable function to create a scene with characters and leaderboard
async function createScene({ url, characters }) {
  return await prisma.scene.create({
    data: {
      url,
      leaderBoard: {
        create: {}
      },
      characters: {
        create: characters
      }
    },
    include: {
      characters: true,
      leaderBoard: true
    }
  });
}


const scene1Data = {
  url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459857/scene3_a8mhlu.jpg",
  characters: [
    {
      xPos: 1160,
      yPos: 830,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459858/scene3_character1_pwisy2.jpg"
    },
    {
      xPos: 1354,
      yPos: 270,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459858/scene3_character2_dnochp.jpg"
    },
    {
      xPos: 600,
      yPos: 1065,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459859/scene3_character3_mvf3fk.jpg"
    }
  ]
};

const scene3Data = {
  url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459854/scene1_dbe3j4.jpg",
  characters: [
    {
      xPos: 1370,
      yPos: 1869,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459853/scene1_character1_d2kjy9.jpg"
    },
    {
      xPos: 1185,
      yPos: 560,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459854/scene1_character2_b0y3n9.jpg"
    },
    {
      xPos: 173,
      yPos: 506,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459854/scene1_character3_cbam92.jpg"
    }
  ]
};
const scene2Data = {
  url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459855/scene2_wu2ajm.jpg",
  characters: [
    {
      xPos: 100,
      yPos: 885,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459856/scene2_character1_i8jqn4.jpg"
    },
    {
      xPos: 1000,
      yPos: 1826,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459856/scene2_character2_q4jszh.jpg"
    },
    {
      xPos: 394,
      yPos: 1346,
      url: "https://res.cloudinary.com/dgngynk3j/image/upload/v1750459857/scene2_character3_uchxbg.jpg"
    }
  ]
};

// Main seed runner
async function main() {
  try {
    const scene1 = await createScene(scene1Data);
    console.log("Seeded scene 1:", scene1);
    const scene2 = await createScene(scene2Data);
    console.log("Seeded scene 2:", scene2);

    const scene3 = await createScene(scene3Data);
    console.log("Seeded scene 3:", scene3);
  } catch (e) {
    console.error("Error during seeding:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
