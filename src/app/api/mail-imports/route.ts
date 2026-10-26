import { NextResponse } from "next/server";
import { canStartNaverMailSync, getNaverMailSyncConfig } from "@/lib/mail/naverMailConfig";
import prisma from "@/lib/prisma";

const RECENT_LOG_LIMIT = 5;

// 화면에는 수집 상태만 보여 주므로 메일 계정·제목·첨부 이름 같은 개인 정보는 돌려주지 않는다.
export async function GET() {
  try {
    const logs = await prisma.mailImportLog.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_LOG_LIMIT,
      select: { id: true, statementMonth: true, rowCount: true, duplicateUpload: true, createdAt: true },
    });

    return NextResponse.json({
      enabled: canStartNaverMailSync(getNaverMailSyncConfig()),
      logs,
    });
  } catch (error) {
    console.error("메일 수집 기록 조회 오류:", error);
    return NextResponse.json({ message: "메일 수집 기록을 불러오지 못했습니다." }, { status: 500 });
  }
}
