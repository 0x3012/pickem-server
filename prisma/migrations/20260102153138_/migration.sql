-- CreateTable
CREATE TABLE `GameConfig` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sport_alias` VARCHAR(191) NOT NULL,
    `lock_offset_sec` INTEGER NOT NULL,
    `base_points` INTEGER NOT NULL,
    `multiplier` DECIMAL(5, 2) NOT NULL,
    `max_multiplier` DECIMAL(5, 2) NOT NULL,
    `allow_draw` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GameConfig_sport_alias_key`(`sport_alias`),
    INDEX `GameConfig_sport_alias_idx`(`sport_alias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FixtureConfigOverride` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `fixture_id` BIGINT NOT NULL,
    `lock_offset_sec` INTEGER NULL,
    `base_points` INTEGER NULL,
    `multiplier` DECIMAL(5, 2) NULL,
    `updated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FixtureConfigOverride_fixture_id_key`(`fixture_id`),
    INDEX `FixtureConfigOverride_fixture_id_idx`(`fixture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
