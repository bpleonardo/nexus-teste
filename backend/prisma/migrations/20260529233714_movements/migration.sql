-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('DEPOSIT', 'SWAP_IN', 'SWAP_OUT', 'SWAP_FEE', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('BRL', 'BTC', 'ETH', 'USDT');

-- CreateTable
CREATE TABLE "Movement" (
    "id" UUID NOT NULL,
    "accountOwner" UUID NOT NULL,
    "type" "MovementType" NOT NULL,
    "currency" "CurrencyType" NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_accountOwner_fkey" FOREIGN KEY ("accountOwner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
