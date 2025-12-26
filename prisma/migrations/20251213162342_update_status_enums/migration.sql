/*
  Warnings:

  - You are about to drop the column `status` on the `kosan` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `kosan` DROP COLUMN `status`,
    ADD COLUMN `status_ketersediaan` ENUM('TERSEDIA', 'PENUH', 'PERAWATAN') NOT NULL DEFAULT 'TERSEDIA',
    ADD COLUMN `status_operasional` ENUM('AKTIF', 'INAKTIF') NOT NULL DEFAULT 'AKTIF';

-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('AKTIF', 'INAKTIF') NOT NULL DEFAULT 'AKTIF';
