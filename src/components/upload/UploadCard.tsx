"use client";

import { Info } from "lucide-react";
import { useState, type FormEvent } from "react";
import StatementDropzone from "@/components/upload/StatementDropzone";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import TextInput from "@/components/ui/TextInput";
import { statementKind, uploadStatement, type UploadResult } from "@/lib/upload/statement";

interface UploadCardProps {
  onResult: (result: UploadResult) => void;
  className?: string;
}

export default function UploadCard({ onResult, className = "" }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const needsPassword = file !== null && statementKind(file.name) === "vestmail";
  const canUpload = file !== null && !uploading && (!needsPassword || password.trim() !== "");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !canUpload) return;
    setUploading(true);
    const result = await uploadStatement(file, needsPassword ? password : "");
    setUploading(false);
    // 저장이 끝난 파일을 한 번 더 올리지 않도록, 성공하면 선택을 비운다.
    if (result.status === "saved") {
      setFile(null);
      setPassword("");
    }
    onResult(result);
  };

  return (
    <Card className={`gap-4 ${className}`}>
      <CardHeader title="파일 업로드" />
      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
        <StatementDropzone
          file={file}
          disabled={uploading}
          onSelect={(selected) => {
            setFile(selected);
            setPassword("");
            setFileError(null);
          }}
          onReject={setFileError}
        />
        {fileError && <p role="alert" className="m-0 text-[13px] leading-[18px] text-danger">{fileError}</p>}

        {needsPassword && (
          <FormField label="보안메일 비밀번호" htmlFor="vestmail-password" hint="보안메일 HTML을 열 때만 쓰고 저장하지 않아요.">
            <TextInput id="vestmail-password" type="password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="보안메일 비밀번호 입력" />
          </FormField>
        )}

        <Button type="submit" variant="primary" disabled={!canUpload} className="min-h-12 text-[15px]">
          {uploading ? "업로드 중…" : "업로드하기"}
        </Button>
      </form>
      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised px-3.5 py-3 text-[13px] leading-5 text-sub">
        <Info size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-primary-text" />
        <p className="m-0">같은 달·같은 건수의 명세서는 다시 저장하지 않아요. 이미 올린 파일을 올리면 중복 안내가 표시돼요.</p>
      </div>
    </Card>
  );
}
