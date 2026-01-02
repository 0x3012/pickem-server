-- CreateTable
CREATE TABLE `Competition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `external_id` BIGINT NOT NULL,
    `sport_alias` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `start_date` BIGINT NULL,
    `end_date` BIGINT NULL,
    `prize_pool_usd` BIGINT NULL,
    `location` VARCHAR(191) NULL,
    `organizer` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `tier` VARCHAR(191) NULL,
    `series` VARCHAR(191) NULL,
    `year` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NULL,
    `ingested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Competition_external_id_key`(`external_id`),
    INDEX `Competition_sport_alias_status_idx`(`sport_alias`, `status`),
    INDEX `Competition_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fixture` (
    `id` BIGINT NOT NULL,
    `competition_id` BIGINT NOT NULL,
    `competition_name` VARCHAR(191) NULL,
    `sport_alias` VARCHAR(191) NOT NULL,
    `sport_name` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `scheduled_start_time` BIGINT NULL,
    `start_time` BIGINT NULL,
    `end_time` BIGINT NULL,
    `tie` INTEGER NULL,
    `winner_id` BIGINT NULL,
    `participants0_id` BIGINT NULL,
    `participants0_name` VARCHAR(191) NULL,
    `participants0_score` INTEGER NULL,
    `participants1_id` BIGINT NULL,
    `participants1_name` VARCHAR(191) NULL,
    `participants1_score` INTEGER NULL,
    `hs_description` VARCHAR(191) NULL,
    `rr_description` VARCHAR(191) NULL,
    `manual_override` INTEGER NULL,
    `manual_updated_at` DATETIME(3) NULL,
    `ingested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Fixture_sport_alias_idx`(`sport_alias`),
    INDEX `Fixture_competition_id_idx`(`competition_id`),
    INDEX `Fixture_start_time_idx`(`start_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `external_id` BIGINT NOT NULL,
    `sport` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `countryISO` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `hs_description` VARCHAR(191) NULL,
    `rr_description` VARCHAR(191) NULL,
    `manual_override` INTEGER NULL,
    `manual_updated_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `ingested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Team_external_id_key`(`external_id`),
    INDEX `Team_sport_idx`(`sport`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
