-- V1 전체 데이터베이스 스키마

CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentType" TEXT NOT NULL,
    "memo" TEXT,
    "categoryId" INTEGER,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoryRule" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CategoryRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExcelUploadLog" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExcelUploadLog_pkey" PRIMARY KEY ("id")
);

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

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "CategoryRule_keyword_categoryId_key" ON "CategoryRule"("keyword", "categoryId");
CREATE UNIQUE INDEX "ExcelUploadLog_date_rowCount_key" ON "ExcelUploadLog"("date", "rowCount");
CREATE UNIQUE INDEX "MailImportLog_provider_mailbox_uid_key" ON "MailImportLog"("provider", "mailbox", "uid");

ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CategoryRule" ADD CONSTRAINT "CategoryRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
