import { body, query, validationResult } from "express-validator";


const alphaErr = "must only contain letters.";
const nameLengthErr = "must be be between 1 and 10 characters.";

export const validateName = [
  body("playerName")
    .notEmpty()
    .withMessage("Please fill out name")
    .trim()
    .isAlpha()
    .withMessage(`Name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Nirst name ${nameLengthErr}`),
];
