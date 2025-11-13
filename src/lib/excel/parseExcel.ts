import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export function parseExcel(fileName: string) {
  const filePath = path
    .join(process.cwd(), "public", "test-data", fileName)
    .replace(/\\/g, "/");

  if (!fs.existsSync(filePath)) {
    throw new Error("엑셀 파일을 찾을 수 없습니다: " + filePath);
  }

  const raw = fs.readFileSync(filePath);
  const workbook = XLSX.read(raw, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  return data;
}