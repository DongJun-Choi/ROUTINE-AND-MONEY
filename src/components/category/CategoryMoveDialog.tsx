"use client";

import { useId, useState } from "react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { Dialog, OverlayHeader } from "@/components/ui/Overlay";
import Select from "@/components/ui/Select";
import { deleteCategory, moveCategoryTransactions } from "@/lib/categories/api";
import { formatNumber } from "@/lib/format";
import type { Category } from "@/lib/types";

interface CategoryMoveDialogProps {
  open: boolean;
  category: Category | null;
  usedCount: number;
  siblings: Category[];
  onClose: () => void;
  onDone: () => void;
}

export default function CategoryMoveDialog({ open, category, ...props }: CategoryMoveDialogProps) {
  if (!open || !category) return null;
  return <CategoryMoveBody category={category} {...props} />;
}

function CategoryMoveBody({ category, usedCount, siblings, onClose, onDone }: Omit<CategoryMoveDialogProps, "open" | "category"> & { category: Category }) {
  const titleId = useId();
  const [targetId, setTargetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    if (!busy) onClose();
  };

  const moveAndDelete = async (newId: number | null) => {
    setBusy(true);
    setError(null);
    const moved = await moveCategoryTransactions(category.id, newId);
    if (!moved.ok) {
      setBusy(false);
      setError(moved.message);
      return;
    }
    const deleted = await deleteCategory(category.id);
    setBusy(false);
    if (deleted.status === "deleted") {
      onDone();
      return;
    }
    setError(deleted.status === "error" ? deleted.message : "거래는 옮겼지만 새로 연결된 거래가 있어 삭제하지 못했어요. 다시 시도해 주세요.");
  };

  return (
    <Dialog open onClose={close} labelledBy={titleId}>
      <OverlayHeader titleId={titleId} title="연결된 거래 옮기기" description={`‘${category.name}’ 소분류를 지우기 전에 거래를 정리해요`} onClose={close} />
      <p className="m-0 text-sm leading-[22px] text-sub">
        ‘{category.name}’ 소분류에 연결된 거래가 <strong className="font-semibold text-heading">{formatNumber(usedCount)}건</strong> 있어요. 다른 소분류로 옮기거나 미분류로 둔 뒤 삭제해요.
      </p>
      <FormField label="옮길 소분류" htmlFor="category-move-target">
        <Select id="category-move-target" value={targetId} onChange={(event) => setTargetId(event.target.value)} disabled={siblings.length === 0 || busy}>
          <option value="">{siblings.length > 0 ? "소분류 선택" : "옮길 수 있는 소분류가 없어요"}</option>
          {siblings.map((sibling) => <option key={sibling.id} value={sibling.id}>{sibling.name}</option>)}
        </Select>
      </FormField>
      {error && <p role="alert" className="m-0 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm leading-5 text-danger">{error}</p>}
      <footer className="flex flex-wrap justify-end gap-2">
        <Button onClick={close} disabled={busy}>취소</Button>
        <Button onClick={() => void moveAndDelete(null)} disabled={busy}>미분류로 두고 삭제</Button>
        <Button variant="destructive" onClick={() => void moveAndDelete(Number(targetId))} disabled={busy || targetId === ""}>
          {busy ? "처리 중…" : "옮기고 삭제"}
        </Button>
      </footer>
    </Dialog>
  );
}
