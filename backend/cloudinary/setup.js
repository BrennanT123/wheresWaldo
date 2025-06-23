//for saving the images using cloudinary
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//gets the url
const url = cloudinary.url("cld-sample-5", {
  transformation: [
    {
      quality: "auto", //sets the quality to compress as much as possible without losing visual information
    },
    {
      fetch_format: "auto", // sets format to use the best format for the browser
    },
    {
      width: 1200, //sets the width to be 1200px
    },
  ],
});
console.log(url);

//for uploading images
(async function () {
  try {
    const result = await cloudinary.uploader.upload(
      "./cloudinary/imgs/penguin.jpeg"
    );
    console.log(result);
    const url = cloudinary.url(result.public_id, {
      transformation: [
        {
          quality: "auto",
        },
        {
          width: 1200,
          height: 1200,
          crop: 'fill', // crops the image
          gravity: 'auto' //determines where the focus is located then crops around that
        },
      ],
    });
    console.log(url);
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
  }
})();
