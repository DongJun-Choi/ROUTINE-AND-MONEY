-- CreateTable
CREATE TABLE "ExcelUploadLog" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExcelUploadLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExcelUploadLog_date_rowCount_key" ON "ExcelUploadLog"("date", "rowCount");
