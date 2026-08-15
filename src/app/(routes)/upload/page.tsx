"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedList, setUploadedList] = useState<any[]>([]);

  const isHtmlFile = file ? /\.(html?|HTML?)$/.test(file.name) : false;

  const handleUpload = async () => {
    if (!file) {
      return alert("업로드할 파일을 선택해 주세요.");
    }

    if (isHtmlFile && !password.trim()) {
      return alert("보안메일 HTML 업로드에는 비밀번호가 필요합니다.");
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      alert("업로드 성공!");
      setUploadedList(data.preview ?? []);
      return;
    }

    alert(`업로드 실패: ${data.message}`);
  };

  return (
    <div className="page-container">
      <div className="page-heading"><h1>내역 가져오기</h1><p>카드 명세서 또는 보안메일 파일을 업로드해 거래를 정리하세요.</p></div>
      <div className="podo-panel mx-auto w-full max-w-2xl p-6 md:p-8">
        <h2 className="mb-6 text-lg font-semibold">카드 내역 파일 업로드</h2>

        <div className="flex flex-col items-center gap-4">
          <label className="w-full cursor-pointer rounded-xl border border-dashed border-[#c9c5d2] bg-[#faf9fc] py-12 text-center transition hover:border-[#4e3a83]">
            <input
              type="file"
              accept=".xlsx,.xls,.html,.htm"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPassword("");
              }}
            />

            <div className="text-gray-500">
              {file ? (
                <>
                  <p className="font-semibold text-blue-600">{file.name}</p>
                  <p className="mt-1 text-sm">
                    다른 파일로 바꾸려면 다시 클릭해 주세요.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-[#302b38]">파일을 선택하거나 여기에 놓아주세요.</p>
                  <p className="mt-1 text-sm">
                    .xlsx / .xls / .html / .htm 지원
                  </p>
                </>
              )}
            </div>
          </label>

          {isHtmlFile && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="보안메일 비밀번호 입력"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-2 w-full rounded-lg bg-[#4e3a83] py-3 font-semibold text-white transition hover:bg-[#3e2e6d] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {uploading ? "업로드 중.." : "업로드하기"}
          </button>
        </div>

        {uploadedList.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold">업로드된 거래 내역</h2>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">날짜</th>
                    <th className="px-3 py-2 text-left">가맹점</th>
                    <th className="px-3 py-2 text-right">금액</th>
                    <th className="px-3 py-2 text-center">결제방식</th>
                    <th className="px-3 py-2 text-center">카테고리</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedList.map((tx, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{tx.date.split("T")[0]}</td>
                      <td className="px-3 py-2">{tx.merchant}</td>
                      <td className="px-3 py-2 text-right">
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {tx.paymentType}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {tx.category?.name ?? "미분류"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
