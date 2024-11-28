/*
  Warnings:

  - Added the required column `type` to the `faq` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "faq" ADD COLUMN     "type" INTEGER NOT NULL;
