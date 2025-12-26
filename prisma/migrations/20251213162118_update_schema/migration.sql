/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `User_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('TERSEDIA', 'PENUH', 'PERAWATAN', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';
