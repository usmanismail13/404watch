/*
  404Watch - Add Support Ticket IDs
*/

-- Add ticketId as nullable first
ALTER TABLE "SupportTicket"
ADD COLUMN "ticketId" TEXT;

-- Give existing support tickets a ticket ID
UPDATE "SupportTicket"
SET "ticketId" = 'TKT-' || LPAD("id"::TEXT, 6, '0')
WHERE "ticketId" IS NULL;

-- Make ticketId required
ALTER TABLE "SupportTicket"
ALTER COLUMN "ticketId" SET NOT NULL;

-- Make ticketId unique
CREATE UNIQUE INDEX "SupportTicket_ticketId_key"
ON "SupportTicket"("ticketId");

-- Add alertSent to Error404 if it has not already been added
ALTER TABLE "Error404"
ADD COLUMN "alertSent" BOOLEAN NOT NULL DEFAULT false;
