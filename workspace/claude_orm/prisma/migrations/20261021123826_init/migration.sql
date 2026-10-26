-- CreateTable
CREATE TABLE `tbl_product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productName` VARCHAR(191) NOT NULL,
    `productPrice` INTEGER NOT NULL,
    `productStock` INTEGER NOT NULL,
    `productDelivery` DATETIME(3) NOT NULL,
    `productCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
