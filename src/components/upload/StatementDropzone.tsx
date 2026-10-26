"use client";

import { FileText, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import Button from "@/components/ui/Button";
import { formatFileSize, STATEMENT_ACCEPT, statementKind, statementKindLabel } from "@/lib/upload/statement";

interface StatementDropzoneProps {
  file: File | null;
  onSelect: (file: File) => void;
  onReject: (message: string) => void;
  disabled?: boolean;
}

export default function StatementDropzone({ file, onSelect, onReject, disabled = false }: StatementDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!statementKind(candidate.name)) {
      onReject("지원하지 않는 파일이에요. .xlsx, .xls, .html, .htm 파일을 올려 주세요.");
      return;
    }
    onSelect(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) pick(event.dataTransfer.files[0]);
  };

  const kind = file ? statementKind(file.name) : null;

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-[176px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed p-6 text-center transition-colors focus-within:ring-[3px] focus-within:ring-primary/35 ${dragging ? "border-primary bg-primary-soft" : "border-line-strong bg-raised hover:border-primary"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={STATEMENT_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            pick(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
          <Upload size={24} strokeWidth={1.8} />
        </span>
        <span className="text-[15px] leading-[22px] font-semibold text-heading">파일을 끌어다 놓거나 눌러서 선택하세요</span>
        <span className="text-[13px] leading-[18px] text-muted">.xlsx · .xls · .html · .htm 지원</span>
      </label>

      {file && kind && (
        <div className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-subtle text-sub">
            <FileText size={20} strokeWidth={1.8} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm leading-5 font-semibold text-heading">{file.name}</span>
            <span className="text-xs leading-4 text-muted">{formatFileSize(file.size)} · {statementKindLabel[kind]}</span>
          </span>
          <Button onClick={() => inputRef.current?.click()} disabled={disabled} className="text-[13px]">다른 파일</Button>
        </div>
      )}
    </div>
  );
}
