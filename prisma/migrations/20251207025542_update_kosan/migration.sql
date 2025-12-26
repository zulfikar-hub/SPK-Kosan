/*
  Warnings:

  - You are about to alter the column `rating` on the `kosan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - Added the required column `updatedAt` to the `kosan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kosan` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `ranking` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `rating` DOUBLE NOT NULL;
