/*
  Warnings:

  - Added the required column `createdAt` to the `Movement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL;
