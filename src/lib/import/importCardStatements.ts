import { parseExcel } from "../excel/parseExcel";
import {
  normalizeExcelData,
  type Transaction as NormalizedTransaction,
} from "../excel/normalizeExcel";
import { loadCategoryRules, findCategoryId } from "../autoCategory";
import prisma from "../prisma";
import { decryptVestmailHtml } from "../vestmail/decryptVestmailHtml";
import { normalizeVestmailHtmlData } from "../vestmail/normalizeVestmailHtml";

export interface MailImportSource {
  provider: string;
  mailbox: string;
  uid: number;
  messageId?: string | null;
  subject?: string | null;
  attachmentName?: string | null;
}

export interface ImportCardStatementInput {
  fileName: string;
  buffer: Buffer;
  password?: string;
  mailSource?: MailImportSource;
  skipDuplicateCheck?: boolean;
}

export interface ImportCardStatementResult {
  count: number;
  month: string;
  preview: Awaited<ReturnType<typeof loadPreviewTransactions>>;
  duplicate: boolean;
}

function isHtmlStatementFile(fileName: string): boolean {
  return /\.(html?|HTML?)$/.test(fileName);
}

function parseStatementTransactions(
  fileName: string,
  buffer: Buffer,
  password = ""
): NormalizedTransaction[] {
  if (isHtmlStatementFile(fileName)) {
    const decryptedHtml = decryptVestmailHtml(buffer, password);
    return normalizeVestmailHtmlData(decryptedHtml);
  }

  return normalizeExcelData(parseExcel(buffer));
}

async function loadPreviewTransactions(month: string) {
  return prisma.transaction.findMany({
    where: {
      date: {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-31`),
      },
    },
    include: {
      category: true,
    },
  });
}

export async function getImportedStatementMonths() {
  const logs = await prisma.excelUploadLog.findMany({
    select: {
      date: true,
    },
  });

  return new Set(logs.map((log) => log.date));
}

function buildMailImportLogData(
  mailSource: MailImportSource,
  month: string,
  rowCount: number,
  duplicateUpload: boolean
) {
  return {
    provider: mailSource.provider,
    mailbox: mailSource.mailbox,
    uid: mailSource.uid,
    messageId: mailSource.messageId ?? null,
    subject: mailSource.subject ?? null,
    attachmentName: mailSource.attachmentName ?? null,
    statementMonth: month,
    rowCount,
    duplicateUpload,
  };
}

async function upsertMailImportLog(
  mailSource: MailImportSource,
  month: string,
  rowCount: number,
  duplicateUpload: boolean
) {
  const data = buildMailImportLogData(
    mailSource,
    month,
    rowCount,
    duplicateUpload
  );

  await prisma.$executeRaw`
    INSERT INTO "MailImportLog" (
      "provider",
      "mailbox",
      "uid",
      "messageId",
      "subject",
      "attachmentName",
      "statementMonth",
      "rowCount",
      "duplicateUpload"
    )
    VALUES (
      ${data.provider},
      ${data.mailbox},
      ${data.uid},
      ${data.messageId},
      ${data.subject},
      ${data.attachmentName},
      ${data.statementMonth},
      ${data.rowCount},
      ${data.duplicateUpload}
    )
    ON CONFLICT ("provider", "mailbox", "uid")
    DO UPDATE SET
      "messageId" = EXCLUDED."messageId",
      "subject" = EXCLUDED."subject",
      "attachmentName" = EXCLUDED."attachmentName",
      "statementMonth" = EXCLUDED."statementMonth",
      "rowCount" = EXCLUDED."rowCount",
      "duplicateUpload" = EXCLUDED."duplicateUpload"
  `;
}

export async function hasMailImportLog(
  mailSource: Pick<MailImportSource, "provider" | "mailbox" | "uid">
) {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "MailImportLog"
    WHERE "provider" = ${mailSource.provider}
      AND "mailbox" = ${mailSource.mailbox}
      AND "uid" = ${mailSource.uid}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function importCardStatement(
  input: ImportCardStatementInput
): Promise<ImportCardStatementResult> {
  const transactions = parseStatementTransactions(
    input.fileName,
    input.buffer,
    input.password
  );

  if (transactions.length === 0) {
    throw new Error("정상 거래가 없습니다.");
  }

  const month = transactions[0].date.slice(0, 7);
  const duplicateUpload = input.skipDuplicateCheck
    ? null
    : await prisma.excelUploadLog.findFirst({
        where: {
          date: month,
          rowCount: transactions.length,
        },
      });

  if (duplicateUpload) {
    if (input.mailSource) {
      await upsertMailImportLog(
        input.mailSource,
        month,
        transactions.length,
        true
      );
    }

    return {
      count: transactions.length,
      month,
      preview: await loadPreviewTransactions(month),
      duplicate: true,
    };
  }

  const rules = await loadCategoryRules();
  const dbData = transactions.map((transaction) => ({
    date: new Date(transaction.date),
    merchant: transaction.merchant,
    amount: Math.abs(transaction.amount),
    type: "EXPENSE",
    paymentType: transaction.paymentType,
    categoryId: findCategoryId(transaction.merchant, rules),
  }));

  await prisma.$transaction(async (tx) => {
    await tx.excelUploadLog.create({
      data: {
        date: month,
        rowCount: transactions.length,
      },
    });

    await tx.transaction.createMany({
      data: dbData,
      skipDuplicates: true,
    });

    if (input.mailSource) {
      const data = buildMailImportLogData(
        input.mailSource,
        month,
        transactions.length,
        false
      );

      await tx.$executeRaw`
        INSERT INTO "MailImportLog" (
          "provider",
          "mailbox",
          "uid",
          "messageId",
          "subject",
          "attachmentName",
          "statementMonth",
          "rowCount",
          "duplicateUpload"
        )
        VALUES (
          ${data.provider},
          ${data.mailbox},
          ${data.uid},
          ${data.messageId},
          ${data.subject},
          ${data.attachmentName},
          ${data.statementMonth},
          ${data.rowCount},
          ${data.duplicateUpload}
        )
        ON CONFLICT ("provider", "mailbox", "uid")
        DO UPDATE SET
          "messageId" = EXCLUDED."messageId",
          "subject" = EXCLUDED."subject",
          "attachmentName" = EXCLUDED."attachmentName",
          "statementMonth" = EXCLUDED."statementMonth",
          "rowCount" = EXCLUDED."rowCount",
          "duplicateUpload" = EXCLUDED."duplicateUpload"
      `;
    }
  });

  return {
    count: transactions.length,
    month,
    preview: await loadPreviewTransactions(month),
    duplicate: false,
  };
}
