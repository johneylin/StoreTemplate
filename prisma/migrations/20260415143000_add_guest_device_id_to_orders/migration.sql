ALTER TABLE "Order"
ADD COLUMN "guestDeviceId" TEXT;

CREATE INDEX "Order_guestDeviceId_createdAt_idx" ON "Order"("guestDeviceId", "createdAt");
