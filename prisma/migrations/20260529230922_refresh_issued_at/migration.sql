/*
  Warnings:

  - Added the required column `issuedAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL;
