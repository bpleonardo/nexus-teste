/*
  Warnings:

  - The values [USDT] on the enum `CurrencyType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `amount` to the `Movement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CurrencyType_new" AS ENUM ('BRL', 'BTC', 'ETH');
ALTER TABLE "Movement" ALTER COLUMN "currency" TYPE "CurrencyType_new" USING ("currency"::text::"CurrencyType_new");
ALTER TYPE "CurrencyType" RENAME TO "CurrencyType_old";
ALTER TYPE "CurrencyType_new" RENAME TO "CurrencyType";
DROP TYPE "public"."CurrencyType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "amount" DECIMAL(20,8) NOT NULL;
