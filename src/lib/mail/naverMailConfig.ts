export interface NaverMailSyncConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  mailbox: string;
  attachmentPassword: string;
  pollIntervalMs: number;
  searchFrom: string;
  searchSubject: string;
  searchSinceDays: number;
  markAsSeen: boolean;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getNaverMailSyncConfig(): NaverMailSyncConfig {
  const user = normalizeString(process.env.NAVER_MAIL_USER);
  const pass = normalizeString(process.env.NAVER_MAIL_PASSWORD);
  const attachmentPassword = normalizeString(
    process.env.NAVER_MAIL_ATTACHMENT_PASSWORD
  );
  const enabled = parseBoolean(
    process.env.NAVER_MAIL_SYNC_ENABLED,
    Boolean(user && pass && attachmentPassword)
  );

  return {
    enabled,
    host: normalizeString(process.env.NAVER_MAIL_IMAP_HOST) || "imap.naver.com",
    port: parseNumber(process.env.NAVER_MAIL_IMAP_PORT, 993),
    secure: parseBoolean(process.env.NAVER_MAIL_IMAP_SECURE, true),
    user,
    pass,
    mailbox: normalizeString(process.env.NAVER_MAIL_IMAP_MAILBOX) || "INBOX",
    attachmentPassword,
    pollIntervalMs: parseNumber(
      process.env.NAVER_MAIL_POLL_INTERVAL_MS,
      5 * 60 * 1000
    ),
    searchFrom:
      normalizeString(process.env.NAVER_MAIL_SEARCH_FROM) ||
      "cyberman@bill.kbcard.com",
    searchSubject:
      normalizeString(process.env.NAVER_MAIL_SEARCH_SUBJECT) ||
      "KB\uAD6D\uBBFC\uCCB4\uD06C\uCE74\uB4DC \uB0B4\uC5ED\uC11C",
    searchSinceDays: parseNumber(
      process.env.NAVER_MAIL_SEARCH_SINCE_DAYS,
      14
    ),
    markAsSeen: parseBoolean(process.env.NAVER_MAIL_MARK_AS_SEEN, false),
  };
}

export function canStartNaverMailSync(config: NaverMailSyncConfig): boolean {
  return Boolean(
    config.enabled &&
      config.user &&
      config.pass &&
      config.attachmentPassword
  );
}
