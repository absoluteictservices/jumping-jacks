-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('held', 'paid', 'cancelled');

-- CreateTable
CREATE TABLE "Inflatable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT,
    "dimensions" TEXT,
    "ageSuitability" TEXT,
    "pricePerDay" INTEGER,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inflatable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "inflatableId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'held',
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryPostcode" TEXT NOT NULL,
    "deliveryTime" TEXT,
    "notes" TEXT,
    "totalPence" INTEGER NOT NULL,
    "stripeCheckoutId" TEXT,
    "stripePaymentIntentId" TEXT,
    "holdExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlackoutDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlackoutDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "maxDeliveriesPerDay" INTEGER NOT NULL DEFAULT 1,
    "minLeadTimeDays" INTEGER NOT NULL DEFAULT 1,
    "deliveryPostcodePrefixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companyEmail" TEXT NOT NULL DEFAULT 'info@jumpingjacksleeds.co.uk',
    "companyPhone" TEXT NOT NULL DEFAULT '07769781666',
    "holdMinutes" INTEGER NOT NULL DEFAULT 15,
    "cancellationPolicy" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inflatable_slug_key" ON "Inflatable"("slug");

-- CreateIndex
CREATE INDEX "Inflatable_active_sortOrder_idx" ON "Inflatable"("active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeCheckoutId_key" ON "Booking"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_date_status_idx" ON "Booking"("date", "status");

-- CreateIndex
CREATE INDEX "Booking_inflatableId_date_status_idx" ON "Booking"("inflatableId", "date", "status");

-- CreateIndex
CREATE INDEX "Booking_holdExpiresAt_idx" ON "Booking"("holdExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlackoutDate_date_key" ON "BlackoutDate"("date");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_inflatableId_fkey" FOREIGN KEY ("inflatableId") REFERENCES "Inflatable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Safety net: one inflatable can never have two ACTIVE bookings on the same date.
CREATE UNIQUE INDEX IF NOT EXISTS "booking_active_castle_date" ON "Booking" ("inflatableId", "date") WHERE status IN ('held', 'paid');
