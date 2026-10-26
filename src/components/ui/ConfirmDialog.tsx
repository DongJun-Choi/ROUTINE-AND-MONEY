"use client";

import { useId, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { Dialog, OverlayHeader } from "@/components/ui/Overlay";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel, destructive = false, busy = false, error, onConfirm, onClose }: ConfirmDialogProps) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };

  return (
    <Dialog open={open} onClose={close} labelledBy={titleId}>
      <OverlayHeader titleId={titleId} title={title} onClose={close} />
      <div className="text-sm leading-[22px] text-sub">{description}</div>
      {error && <p role="alert" className="m-0 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm leading-5 text-danger">{error}</p>}
      <footer className="flex justify-end gap-2">
        <Button onClick={close} disabled={busy}>취소</Button>
        <Button variant={destructive ? "destructive" : "primary"} onClick={onConfirm} disabled={busy} data-autofocus>
          {busy ? "처리 중…" : confirmLabel}
        </Button>
      </footer>
    </Dialog>
  );
}
