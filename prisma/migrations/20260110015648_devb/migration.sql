-- AlterTable
ALTER TABLE `fixtureconfigoverride` ALTER COLUMN `tenant_id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `gameconfig` ALTER COLUMN `tenant_id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `matchpick` ALTER COLUMN `tenant_id` DROP DEFAULT;
