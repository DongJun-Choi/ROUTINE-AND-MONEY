-- CreateTable
CREATE TABLE "MailImportLog" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "mailbox" TEXT NOT NULL,
    "uid" INTEGER NOT NULL,
    "messageId" TEXT,
    "subject" TEXT,
    "attachmentName" TEXT,
    "statementMonth" TEXT,
    "rowCount" INTEGER,
    "duplicateUpload" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailImportLog_provider_mailbox_uid_key" ON "MailImportLog"("provider", "mailbox", "uid");
