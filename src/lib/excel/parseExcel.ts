import * as XLSX from "xlsx";

export function parseExcel(buffer: Buffer): any[][] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  return rows;
}
