import { ImapFlow, type SearchObject } from "imapflow";
import {
  getImportedStatementMonths,
  importCardStatement,
  type MailImportSource,
} from "../import/importCardStatements";
import {
  canStartNaverMailSync,
  getNaverMailSyncConfig,
} from "./naverMailConfig";

type ParsedMailAttachment = {
  filename?: string | null;
  content: Buffer | Uint8Array;
  contentType?: string;
};

type ParsedMail = {
  subject?: string | null;
  messageId?: string | null;
  attachments: ParsedMailAttachment[];
};

const { simpleParser } = require("mailparser") as {
  simpleParser: (source: Buffer) => Promise<ParsedMail>;
};

export interface NaverMailSyncResult {
  scanned: number;
  imported: number;
  duplicates: number;
  skipped: number;
}

function extractStatementMonth(subject: string | null | undefined) {
  if (!subject) {
    return null;
  }

  const matched = subject.match(/(\d{4})\uB144\s*(\d{2})\uC6D4/);

  if (!matched) {
    return null;
  }

  return `${matched[1]}-${matched[2]}`;
}

function isKbStatementSubject(subject: string | null | undefined) {
  if (!subject) {
    return false;
  }

  return /^\(KB\uAD6D\uBBFC\uCE74\uB4DC\).*\d{4}\uB144\s*\d{2}\uC6D4\s*KB\uAD6D\uBBFC\uCCB4\uD06C\uCE74\uB4DC \uB0B4\uC5ED\uC11C$/.test(
    subject.trim()
  );
}

function buildSearchQuery(config: ReturnType<typeof getNaverMailSyncConfig>) {
  const query: SearchObject = {};

  if (config.searchFrom) {
    query.from = config.searchFrom;
  }

  if (config.searchSubject) {
    query.subject = config.searchSubject;
  }

  if (config.searchSinceDays > 0) {
    query.since = new Date(
      Date.now() - config.searchSinceDays * 24 * 60 * 60 * 1000
    );
  }

  if (Object.keys(query).length === 0) {
    query.all = true;
  }

  return query;
}

function findHtmlAttachment(attachments: ParsedMailAttachment[]) {
  return attachments.find((attachment) => {
    const fileName = attachment.filename?.toLowerCase() ?? "";
    const contentType = attachment.contentType?.toLowerCase() ?? "";

    return (
      fileName.endsWith(".html") ||
      fileName.endsWith(".htm") ||
      contentType === "text/html"
    );
  });
}

function toBuffer(content: Buffer | Uint8Array): Buffer {
  return Buffer.isBuffer(content) ? content : Buffer.from(content);
}

export async function syncNaverMail(): Promise<NaverMailSyncResult> {
  const config = getNaverMailSyncConfig();

  if (!canStartNaverMailSync(config)) {
    return {
      scanned: 0,
      imported: 0,
      duplicates: 0,
      skipped: 0,
    };
  }

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    logger: false,
  });

  let scanned = 0;
  let imported = 0;
  let duplicates = 0;
  let skipped = 0;

  await client.connect();

  const lock = await client.getMailboxLock(config.mailbox);

  try {
    const importedMonths = await getImportedStatementMonths();
    const searchResult = await client.search(buildSearchQuery(config), {
      uid: true,
    });
    const sortedUids = (searchResult === false ? [] : [...searchResult]).sort(
      (left, right) => right - left
    );
    scanned = sortedUids.length;

    for (const uid of sortedUids) {
      try {
        const overview = await client.fetchOne(
          String(uid),
          {
            uid: true,
            envelope: true,
          },
          { uid: true }
        );

        if (!overview) {
          skipped += 1;
          continue;
        }

        const subject = overview.envelope?.subject ?? null;

        if (!isKbStatementSubject(subject)) {
          skipped += 1;
          continue;
        }

        const statementMonth = extractStatementMonth(subject);

        if (!statementMonth) {
          skipped += 1;
          continue;
        }

        if (importedMonths.has(statementMonth)) {
          duplicates += 1;
          continue;
        }

        const message = await client.fetchOne(
          String(uid),
          {
            uid: true,
            envelope: true,
            source: true,
          },
          { uid: true }
        );

        if (!message) {
          skipped += 1;
          continue;
        }

        if (!message.source) {
          skipped += 1;
          continue;
        }

        const parsed = await simpleParser(message.source);
        const attachment = findHtmlAttachment(parsed.attachments ?? []);

        if (!attachment) {
          skipped += 1;
          continue;
        }

        const mailSource: MailImportSource = {
          provider: "naver",
          mailbox: config.mailbox,
          uid,
        };

        const result = await importCardStatement({
          fileName: attachment.filename ?? `naver-mail-${uid}.html`,
          buffer: toBuffer(attachment.content),
          password: config.attachmentPassword,
          skipDuplicateCheck: true,
          mailSource: {
            ...mailSource,
            messageId: parsed.messageId ?? null,
            subject: parsed.subject ?? subject,
            attachmentName: attachment.filename ?? null,
          },
        });

        importedMonths.add(result.month);
        imported += 1;

        if (config.markAsSeen) {
          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
        }
      } catch (error) {
        console.error(`[naver-mail-sync] UID ${uid} 처리 실패`, error);
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return {
    scanned,
    imported,
    duplicates,
    skipped,
  };
}
