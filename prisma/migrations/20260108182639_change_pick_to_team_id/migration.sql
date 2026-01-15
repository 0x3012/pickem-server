/*
  Warnings:

  - You are about to drop the column `pick` on the `matchpick` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `matchpick` DROP COLUMN `pick`,
    ADD COLUMN `picked_team_id` BIGINT NULL;

-- CreateIndex
CREATE INDEX `MatchPick_picked_team_id_idx` ON `MatchPick`(`picked_team_id`);
