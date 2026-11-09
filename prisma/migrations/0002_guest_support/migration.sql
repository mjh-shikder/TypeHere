-- Add guestName column for ghost user leaderboard entries
ALTER TABLE "TestResult" ADD COLUMN "guestName" TEXT;
CREATE INDEX "TestResult_guestName_duration_idx" ON "TestResult"("guestName", "duration");
