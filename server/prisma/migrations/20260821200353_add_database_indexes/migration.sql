-- CreateIndex
CREATE INDEX "Error404_websiteId_idx" ON "Error404"("websiteId");

-- CreateIndex
CREATE INDEX "Error404_status_idx" ON "Error404"("status");

-- CreateIndex
CREATE INDEX "Scan_websiteId_idx" ON "Scan"("websiteId");

-- CreateIndex
CREATE INDEX "Scan_status_idx" ON "Scan"("status");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Website_userId_idx" ON "Website"("userId");
