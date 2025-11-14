"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("파일을 선택하세요");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("업로드 성공!");
      console.log(data);
    } else {
      alert(`업로드 실패: ${data.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>엑셀 업로드</h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload}>업로드하기</button>
    </div>
  );
}