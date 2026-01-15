-- CreateTable
CREATE TABLE `MatchPick` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `fixture_id` BIGINT NOT NULL,
    `pick` ENUM('A', 'B', 'DRAW') NOT NULL,
    `user_lock_time` DATETIME(3) NULL,
    `server_received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `MatchPick_fixture_id_idx`(`fixture_id`),
    INDEX `MatchPick_user_id_idx`(`user_id`),
    UNIQUE INDEX `MatchPick_user_id_fixture_id_key`(`user_id`, `fixture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
