import "dotenv/config";
import { ImapFlow } from "imapflow";
import { getNaverMailSyncConfig } from "../../lib/mail/naverMailConfig";

async function main() {
  const config = getNaverMailSyncConfig();

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

  try {
    const mailboxes = await client.list();

    console.info(`[naver-mail-test] mailboxes=${mailboxes.length}`);

    mailboxes.forEach((mailbox, index) => {
      console.info(
        [
          `[${index + 1}]`,
          `path=${mailbox.path}`,
          `name=${mailbox.name}`,
          `specialUse=${mailbox.specialUse ?? ""}`,
          `listed=${mailbox.listed}`,
          `subscribed=${mailbox.subscribed}`,
        ].join(" | ")
      );
    });
  } finally {
    await client.logout();
  }
}

main().catch((error) => {
  console.error("[naver-mail-test] failed to load mailboxes", error);
  process.exit(1);
});
