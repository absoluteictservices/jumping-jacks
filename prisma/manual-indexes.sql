-- NOTE: This index is now created automatically by the Prisma migration in
-- prisma/migrations/0_init/migration.sql, which runs on every deploy
-- (`prisma migrate deploy`). You normally do NOT need to run this file by hand.
--
-- It is kept here only as a manual fallback (safe to re-run; uses IF NOT EXISTS).
-- It guarantees one inflatable can never have two ACTIVE bookings on the same
-- date, even under a race condition.

CREATE UNIQUE INDEX IF NOT EXISTS "booking_active_castle_date"
  ON "Booking" ("inflatableId", "date")
  WHERE status IN ('held', 'paid');
