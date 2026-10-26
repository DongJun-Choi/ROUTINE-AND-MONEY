CREATE TABLE "TransactionSplit" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "amount" INTEGER NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionSplit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TransactionSplit_transactionId_idx" ON "TransactionSplit"("transactionId");
CREATE INDEX "TransactionSplit_categoryId_idx" ON "TransactionSplit"("categoryId");

ALTER TABLE "TransactionSplit" ADD CONSTRAINT "TransactionSplit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionSplit" ADD CONSTRAINT "TransactionSplit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
