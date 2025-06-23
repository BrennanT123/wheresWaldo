/*
  Warnings:

  - Added the required column `session` to the `CurrentGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrentGame" ADD COLUMN     "session" INTEGER NOT NULL;
