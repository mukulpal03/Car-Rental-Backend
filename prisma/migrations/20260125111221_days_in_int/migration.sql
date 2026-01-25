/*
  Warnings:

  - Changed the type of `days` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "days",
ADD COLUMN     "days" INTEGER NOT NULL;
