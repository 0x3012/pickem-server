/*
  Warnings:

  - A unique constraint covering the columns `[apiKey]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiKey` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `apiKey` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Tenant_apiKey_key` ON `Tenant`(`apiKey`);
