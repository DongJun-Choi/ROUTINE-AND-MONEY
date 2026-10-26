"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// 드로어 위에 대화상자가 겹쳐 열릴 수 있어서, 마지막 오버레이가 닫힐 때만 본문 스크롤을 되돌린다.
let openOverlayCount = 0;

function useOverlay(open: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openOverlayCount += 1;
    document.body.style.overflow = "hidden";
    const container = containerRef.current;
    (container?.querySelector<HTMLElement>("[data-autofocus]") ?? container)?.focus();

    return () => {
      openOverlayCount -= 1;
      if (openOverlayCount === 0) document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open]);

  return containerRef;
}

function handleOverlayKeyDown(event: KeyboardEvent<HTMLElement>, onClose: () => void) {
  if (event.key === "Escape") {
    event.stopPropagation();
    onClose();
    return;
  }
  if (event.key !== "Tab") return;

  const focusables = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((element) => element.offsetParent !== null);
  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, labelledBy, children }: OverlayProps) {
  const containerRef = useOverlay(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" className="absolute inset-0 bg-scrim backdrop-blur-[2px]" onClick={onClose} />
      <section
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={(event) => handleOverlayKeyDown(event, onClose)}
        className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-line bg-surface shadow-modal outline-none"
      >
        {children}
      </section>
    </div>
  );
}

const dialogWidth = {
  sm: "max-w-[400px]",
  lg: "max-w-[680px]",
};

export function Dialog({ open, onClose, labelledBy, children, size = "sm" }: OverlayProps & { size?: keyof typeof dialogWidth }) {
  const containerRef = useOverlay(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-scrim" onClick={onClose} />
      <section
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={(event) => handleOverlayKeyDown(event, onClose)}
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-5 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-modal outline-none sm:p-6 ${dialogWidth[size]}`}
      >
        {children}
      </section>
    </div>
  );
}

interface OverlayHeaderProps {
  titleId: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  large?: boolean;
  onClose: () => void;
}

export function OverlayHeader({ titleId, title, description, icon, large = false, onClose }: OverlayHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-text">{icon}</span>}
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={titleId} className={`m-0 font-semibold text-heading ${large ? "text-xl leading-7 tracking-[-0.015em]" : "text-lg leading-[26px] tracking-[-0.01em]"}`}>{title}</h2>
          {description && <p className="m-0 text-[13px] leading-[18px] text-muted">{description}</p>}
        </div>
      </div>
      <button type="button" aria-label="닫기" onClick={onClose} className="-mt-1.5 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-[10px] text-sub transition-colors hover:bg-subtle">
        <X size={20} strokeWidth={2} aria-hidden="true" />
      </button>
    </header>
  );
}
