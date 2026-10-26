-- CreateTable
CREATE TABLE `tbl_post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postTitle` VARCHAR(191) NOT NULL,
    `postContent` TEXT NOT NULL,
    `postCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `memberId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_post` ADD CONSTRAINT `tbl_post_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `tbl_member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
