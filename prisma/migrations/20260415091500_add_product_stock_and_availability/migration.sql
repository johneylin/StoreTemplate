CREATE TYPE "ProductAvailability" AS ENUM ('ACTIVE', 'COMING_SOON');

ALTER TABLE "Product"
ADD COLUMN "stockQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "availability" "ProductAvailability" NOT NULL DEFAULT 'ACTIVE';
