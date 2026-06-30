import {
  canStartNaverMailSync,
  getNaverMailSyncConfig,
} from "@/lib/mail/naverMailConfig";
import { syncNaverMail } from "@/lib/mail/syncNaverMail";

type MailWorkerGlobal = typeof globalThis & {
  __naverMailSyncStarted__?: boolean;
  __naverMailSyncRunning__?: boolean;
  __naverMailSyncTimer__?: NodeJS.Timeout;
};

const mailWorkerGlobal = globalThis as MailWorkerGlobal;

async function runSyncCycle() {
  if (mailWorkerGlobal.__naverMailSyncRunning__) {
    return;
  }

  mailWorkerGlobal.__naverMailSyncRunning__ = true;

  try {
    const result = await syncNaverMail();

    if (result.scanned > 0) {
      console.info(
        `[naver-mail-sync] 스캔 ${result.scanned}건, 신규 ${result.imported}건, 중복 ${result.duplicates}건, 제외 ${result.skipped}건`
      );
    }
  } catch (error) {
    console.error("[naver-mail-sync] 동기화 실패", error);
  } finally {
    mailWorkerGlobal.__naverMailSyncRunning__ = false;
  }
}

export function startNaverMailSyncWorker() {
  const config = getNaverMailSyncConfig();

  if (!canStartNaverMailSync(config)) {
    console.info(
      "[naver-mail-sync] 비활성화됨: NAVER_MAIL_USER, NAVER_MAIL_PASSWORD, NAVER_MAIL_ATTACHMENT_PASSWORD 설정을 확인하세요."
    );
    return;
  }

  if (mailWorkerGlobal.__naverMailSyncStarted__) {
    return;
  }

  mailWorkerGlobal.__naverMailSyncStarted__ = true;

  void runSyncCycle();

  mailWorkerGlobal.__naverMailSyncTimer__ = setInterval(() => {
    void runSyncCycle();
  }, config.pollIntervalMs);
}
