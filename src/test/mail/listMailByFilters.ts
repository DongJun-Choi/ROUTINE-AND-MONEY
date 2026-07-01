import "dotenv/config";
import { ImapFlow, type SearchObject } from "imapflow";
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

async function printSearchResults(
  client: ImapFlow,
  title: string,
  query: SearchObject
) {
  const searchResult = await client.search(query, { uid: true });
  const uids =
    searchResult === false ? [] : [...searchResult].sort((a, b) => b - a);

  console.info(`[naver-mail-test] ${title}: ${uids.length}`);

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
}

async function main() {
  const config = getNaverMailSyncConfig();
  const since = new Date(
    Date.now() - config.searchSinceDays * 24 * 60 * 60 * 1000
  );

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
    await printSearchResults(client, "from filter only", {
      from: config.searchFrom,
      since,
    });

    await printSearchResults(client, "subject filter only", {
      subject: config.searchSubject,
      since,
    });
  } finally {
    lock.release();
    await client.logout();
  }
}

main().catch((error) => {
  console.error("[naver-mail-test] failed to load filtered mails", error);
  process.exit(1);
});
