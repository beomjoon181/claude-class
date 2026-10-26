-- CreateTable
CREATE TABLE `tbl_board` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `boardTitle` VARCHAR(255) NOT NULL,
    `boardContent` TEXT NOT NULL,
    `boardIsOpen` BOOLEAN NOT NULL DEFAULT true,
    `boardCheckedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `memberId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tbl_board` ADD CONSTRAINT `tbl_board_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `tbl_member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
