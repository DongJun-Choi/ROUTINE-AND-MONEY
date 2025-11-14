"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("📂 업로드할 파일을 선택하세요!");

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      alert("업로드 성공!");
      console.log(data);
    } else {
      alert(`업로드 실패: ${data.message}`);
    }
  };

  return (
    <div className="flex justify-center py-12 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg border border-gray-200">

        <h1 className="text-2xl font-bold mb-6 text-center">
          📤 엑셀 파일 업로드
        </h1>

        <div className="flex flex-col items-center gap-4">

          {/* 업로드 박스 */}
          <label
            className="
              w-full border-2 border-dashed border-gray-300 rounded-lg
              py-10 text-center cursor-pointer hover:border-blue-400 transition
            "
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <div className="text-gray-500">
              {file ? (
                <>
                  <p className="font-semibold text-blue-600">
                    {file.name}
                  </p>
                  <p className="text-sm">(새 파일로 변경하려면 클릭)</p>
                </>
              ) : (
                <>
                  <p className="text-lg">📄 파일을 선택하거나 클릭하세요</p>
                  <p className="text-sm mt-1">.xlsx / .xls 지원</p>
                </>
              )}
            </div>
          </label>

          {/* 업로드 버튼 */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="
              w-full py-3 mt-2 rounded-lg font-semibold text-white
              bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition
            "
          >
            {uploading ? "업로드 중..." : "업로드하기"}
          </button>
        </div>
      </div>
    </div>
  );
}