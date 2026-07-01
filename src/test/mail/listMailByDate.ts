import "dotenv/config";
import { ImapFlow } from "imapflow";
import { getNaverMailSyncConfig } from "../../lib/mail/naverMailConfig";

function formatFromAddress(
  addresses:
    | Array<{ name?: string | null; address?: string | null }>
    | undefined
) {
  if (!addresses || addresses.length === 0) {
    return "";
  }

  return addresses
    .map((item) => {
      const name = item.name?.trim();
      const address = item.address?.trim();

      if (name && address) {
        return `${name} <${address}>`;
      }

      return address ?? name ?? "";
    })
    .filter(Boolean)
    .join(", ");
}

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

function nextDate(value: string) {
  const date = toDateOnly(value);
  date.setDate(date.getDate() + 1);
  return date;
}

async function main() {
  const targetDate = process.argv[2] || "2026-06-10";
  const config = getNaverMailSyncConfig();
  const since = toDateOnly(targetDate);
  const before = nextDate(targetDate);

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

  await client.connect();

  const lock = await client.getMailboxLock(config.mailbox);

  try {
    const searchResult = await client.search(
      {
        since,
        before,
      },
      { uid: true }
    );

    const uids =
      searchResult === false ? [] : [...searchResult].sort((a, b) => b - a);

    console.info(`[naver-mail-test] date=${targetDate}`);
    console.info(`[naver-mail-test] mails=${uids.length}`);

    for (const [index, uid] of uids.entries()) {
      const message = await client.fetchOne(
        String(uid),
        {
          uid: true,
          envelope: true,
          internalDate: true,
        },
        { uid: true }
      );

      if (!message) {
        continue;
      }

      console.info(
        [
          `[${index + 1}]`,
          `seq=${message.seq}`,
          `uid=${message.uid}`,
          `date=${
            message.internalDate
              ? new Date(message.internalDate).toISOString()
              : ""
          }`,
          `from=${formatFromAddress(message.envelope?.from)}`,
          `subject=${message.envelope?.subject ?? ""}`,
        ].join(" | ")
      );
    }
  } finally {
    lock.release();
    await client.logout();
  }
}

main().catch((error) => {
  console.error("[naver-mail-test] failed to load mails by date", error);
  process.exit(1);
});
