/*
  Warnings:

  - A unique constraint covering the columns `[user_id,fixture_id,tenant_id]` on the table `MatchPick` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `FixtureConfigOverride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `GameConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `MatchPick` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `MatchPick_user_id_fixture_id_key` ON `matchpick`;

-- AlterTable
ALTER TABLE `fixtureconfigoverride` ADD COLUMN `tenant_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `gameconfig` ADD COLUMN `tenant_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `matchpick` ADD COLUMN `tenant_id` BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX `FixtureConfigOverride_tenant_id_idx` ON `FixtureConfigOverride`(`tenant_id`);

-- CreateIndex
CREATE INDEX `GameConfig_tenant_id_idx` ON `GameConfig`(`tenant_id`);

-- CreateIndex
CREATE INDEX `MatchPick_tenant_id_idx` ON `MatchPick`(`tenant_id`);

-- CreateIndex
CREATE UNIQUE INDEX `MatchPick_user_id_fixture_id_tenant_id_key` ON `MatchPick`(`user_id`, `fixture_id`, `tenant_id`);
