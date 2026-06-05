/*
  Warnings:

  - The primary key for the `UserCredentials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserCredentials` table. All the data in the column will be lost.
  - Added the required column `email` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_userId_fkey";

-- AlterTable
ALTER TABLE "UserCredentials" DROP CONSTRAINT "UserCredentials_pkey",
DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD CONSTRAINT "UserCredentials_pkey" PRIMARY KEY ("email");

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
