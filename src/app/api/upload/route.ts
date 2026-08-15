import { NextResponse } from "next/server";
import { importCardStatement } from "@/lib/import/importCardStatements";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = String(formData.get("password") ?? "");

    if (!file) {
      return NextResponse.json(
        { message: "파일이 존재하지 않습니다." },
        { status: 400 }
      );
    }

    const result = await importCardStatement({
      fileName: file.name,
      buffer: Buffer.from(await file.arrayBuffer()),
      password,
    });

    if (result.duplicate) {
      return NextResponse.json(
        { message: "이미 업로드한 거래 파일입니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "업로드 및 저장 성공",
      count: result.count,
      preview: result.preview,
    });
  } catch (error) {
    console.error("업로드 오류:", error);
    return NextResponse.json(
      { message: "서버 오류 발생", error: String(error) },
      { status: 500 }
    );
  }
}
