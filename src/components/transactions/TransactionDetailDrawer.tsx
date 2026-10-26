"use client";

import { Split, Trash2, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";
import CategoryChipPicker from "@/components/transactions/CategoryChipPicker";
import CategorySplitDialog from "@/components/transactions/CategorySplitDialog";
import NWaySplitDialog from "@/components/transactions/NWaySplitDialog";
import SplitSummaryCard from "@/components/transactions/SplitSummaryCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import MoneyInput from "@/components/ui/MoneyInput";
import { Drawer, OverlayHeader } from "@/components/ui/Overlay";
import TextArea from "@/components/ui/TextArea";
import TextInput from "@/components/ui/TextInput";
import ToggleChip from "@/components/ui/ToggleChip";
import { toDateKey } from "@/lib/date";
import { formatNumber, withRoParticle } from "@/lib/format";
import { createCategoryRule, deleteTransaction, saveTransaction } from "@/lib/transactions/api";
import type { SplitDraft } from "@/lib/transactions/split";
import { categoryPathById } from "@/lib/transactionDisplay";
import type { Category, PaymentType, Transaction, TransactionType } from "@/lib/types";

interface TransactionDetailDrawerProps {
  open: boolean;
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const TITLE_ID = "transaction-detail-title";
const MEMO_MAX_LENGTH = 100;
const sectionTitleClass = "m-0 text-sm leading-5 font-semibold text-heading";

const TYPE_OPTIONS: { value: TransactionType; label: string; activeClass: string }[] = [
  { value: "EXPENSE", label: "지출", activeClass: "border-danger-line bg-danger-soft text-danger" },
  { value: "INCOME", label: "수입", activeClass: "border-positive-line bg-positive-soft text-positive" },
];

const PAYMENT_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: "CARD", label: "카드 결제" },
  { value: "POINT", label: "포인트" },
  { value: "MIXED", label: "혼합 결제" },
];

function SplitToolButton({ icon: Icon, title, description, onClick }: { icon: LucideIcon; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-16 items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 text-left transition-colors hover:bg-subtle">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary-soft-text">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm leading-5 font-semibold text-heading">{title}</span>
        <span className="text-xs leading-4 text-muted">{description}</span>
      </span>
    </button>
  );
}

export default function TransactionDetailDrawer(props: TransactionDetailDrawerProps) {
  // 닫힐 때 폼을 내려서, 다시 열면 고른 거래 값으로 처음부터 채운다.
  if (!props.open) return null;
  return <TransactionDetailForm {...props} />;
}

function TransactionDetailForm({ transaction, categories, onClose, onSaved, onDeleted }: TransactionDetailDrawerProps) {
  const isEdit = transaction !== null;
  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  // 목록과 같은 날짜로 보이도록 저장된 날짜 문자열을 그대로 쓴다.
  const [date, setDate] = useState(transaction ? transaction.date.slice(0, 10) : toDateKey(new Date()));
  const [amount, setAmount] = useState<number | null>(transaction ? transaction.amount : null);
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "EXPENSE");
  const [paymentType, setPaymentType] = useState<PaymentType>(transaction?.paymentType ?? "CARD");
  const [categoryId, setCategoryId] = useState<number | null>(transaction?.categoryId ?? null);
  const [splits, setSplits] = useState<SplitDraft[]>(() => (transaction?.splits ?? []).map((split) => ({ amount: split.amount, categoryId: split.categoryId, label: split.label ?? "" })));
  const [memo, setMemo] = useState(transaction?.memo ?? "");
  const [createRule, setCreateRule] = useState(false);
  const [ruleKeyword, setRuleKeyword] = useState(transaction?.merchant ?? "");
  const [dialog, setDialog] = useState<"none" | "n-way" | "category-split">("none");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpense = type === "EXPENSE";
  const hasSplits = isExpense && splits.length > 0;
  const validAmount = amount !== null && amount > 0 ? amount : null;
  const canSave = merchant.trim() !== "" && date !== "" && validAmount !== null;
  const categoryLabel = categoryPathById(categories, categoryId);
  const showRule = isExpense && !hasSplits && categoryId !== null && categoryLabel !== null;

  const changeType = (next: TransactionType) => {
    setType(next);
    if (next === "INCOME") {
      setSplits([]);
      setCreateRule(false);
    }
  };

  const handleSave = async () => {
    if (!canSave || validAmount === null) return;
    setSaving(true);
    setError(null);
    const finalCategoryId = hasSplits ? null : categoryId;
    const result = await saveTransaction(
      {
        date,
        merchant: merchant.trim(),
        amount: isExpense ? -validAmount : validAmount,
        paymentType,
        categoryId: finalCategoryId,
        memo,
        splits: hasSplits ? splits : [],
      },
      transaction?.id,
    );

    if (!result.ok) {
      setSaving(false);
      setError(result.message);
      return;
    }

    // 거래는 이미 저장됐으므로 규칙 생성이 실패해도 창을 닫는다. 다시 저장하면 새 거래가 중복으로 생길 수 있다.
    if (showRule && createRule && finalCategoryId !== null && ruleKeyword.trim()) {
      const ruleCreated = await createCategoryRule(ruleKeyword.trim(), finalCategoryId);
      if (!ruleCreated) window.alert("거래는 저장했지만 자동 분류 규칙을 만들지 못했어요. 카테고리 화면에서 다시 추가해 주세요.");
    }
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setDeleting(true);
    setError(null);
    const result = await deleteTransaction(transaction.id);
    if (!result.ok) {
      setDeleting(false);
      setConfirmingDelete(false);
      setError(result.message);
      return;
    }
    onDeleted();
    onClose();
  };

  const helper = validAmount !== null
    ? `${isExpense ? "−" : "+"}${formatNumber(validAmount)}원 · ${isExpense ? "지출로" : "수입으로"} 기록돼요`
    : "날짜, 가맹점, 금액을 입력하면 저장할 수 있어요";

  return (
    <>
      <Drawer open onClose={onClose} labelledBy={TITLE_ID}>
        <div className="border-b border-subtle px-5 py-5 sm:px-6">
          <OverlayHeader
            large
            titleId={TITLE_ID}
            title={isEdit ? "거래 상세" : "내역 추가"}
            description={isEdit ? "고친 내용은 저장해야 가계부에 반영돼요" : "카드 명세서에 없는 거래를 직접 적어요"}
            onClose={onClose}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-6">
          <section aria-label="기본 정보" className="flex flex-col gap-3.5 rounded-2xl border border-line bg-raised p-4">
            <FormField label="가맹점" htmlFor="transaction-merchant">
              <TextInput
                id="transaction-merchant"
                data-autofocus={isEdit ? undefined : true}
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                placeholder="예: 스타벅스 강남점"
                className="h-12 text-[17px] font-semibold"
              />
            </FormField>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] gap-3">
              <FormField label="날짜" htmlFor="transaction-date">
                <TextInput id="transaction-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </FormField>
              <FormField label="금액" htmlFor="transaction-amount">
                <MoneyInput id="transaction-amount" value={amount} onChange={setAmount} />
              </FormField>
            </div>
            <p className="m-0 text-[13px] leading-[18px] text-muted">{helper}</p>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 id="transaction-type-label" className={sectionTitleClass}>거래 유형</h3>
            <div role="group" aria-labelledby="transaction-type-label" className="flex gap-2">
              {TYPE_OPTIONS.map((option) => {
                const active = type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => changeType(option.value)}
                    className={`min-h-11 min-w-0 flex-1 rounded-[10px] border px-3 text-sm transition-colors ${active ? `${option.activeClass} font-semibold` : "border-line-strong bg-surface font-medium text-sub hover:bg-subtle"}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <h3 id="transaction-payment-label" className={sectionTitleClass}>결제 방식</h3>
            <div role="group" aria-labelledby="transaction-payment-label" className="flex gap-2">
              {PAYMENT_OPTIONS.map((option) => (
                <ToggleChip key={option.value} active={paymentType === option.value} onClick={() => setPaymentType(option.value)} className="min-w-0 flex-1 px-2 text-[13px]">
                  {option.label}
                </ToggleChip>
              ))}
            </div>
          </section>

          {hasSplits ? (
            <SplitSummaryCard splits={splits} categories={categories} onEdit={() => setDialog("category-split")} onClear={() => setSplits([])} />
          ) : (
            isExpense && validAmount !== null && (
              <section className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <h3 className={sectionTitleClass}>금액 나누기</h3>
                  <p className="m-0 text-[13px] leading-[18px] text-muted">같이 낸 결제나 여러 품목이 섞인 결제를 나눠요</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-2">
                  <SplitToolButton icon={Users} title="n빵 계산" description="인원수로 나눠 내 몫만 남겨요" onClick={() => setDialog("n-way")} />
                  <SplitToolButton icon={Split} title="카테고리 나누기" description="품목별로 카테고리를 정해요" onClick={() => setDialog("category-split")} />
                </div>
              </section>
            )
          )}

          <section className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-0.5">
              <h3 id="transaction-category-label" className={sectionTitleClass}>카테고리</h3>
              {hasSplits && <p className="m-0 text-[13px] leading-[18px] text-tone-indigo">카테고리를 나눈 거래라 대표 카테고리는 고를 수 없어요. 위의 분할 항목에서 바꿔 주세요.</p>}
            </div>
            <CategoryChipPicker
              labelledBy="transaction-category-label"
              categories={categories}
              value={hasSplits ? null : categoryId}
              onChange={setCategoryId}
              emptyLabel="미분류"
              disabled={hasSplits}
            />
          </section>

          {showRule && categoryLabel !== null && (
            <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
              <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm leading-5 font-semibold text-heading">이 가맹점 자동 분류 규칙 만들기</span>
                  <span className="text-[13px] leading-[18px] text-muted">다음부터 키워드가 들어간 가맹점은 {withRoParticle(categoryLabel)} 분류해요</span>
                </span>
                <input
                  type="checkbox"
                  checked={createRule}
                  onChange={(event) => {
                    setCreateRule(event.target.checked);
                    if (event.target.checked && !ruleKeyword.trim()) setRuleKeyword(merchant);
                  }}
                  className="size-5 shrink-0 cursor-pointer accent-primary"
                />
              </label>
              {createRule && (
                <div className="border-t border-subtle pt-3">
                  <FormField label="가맹점명에 들어갈 키워드" htmlFor="transaction-rule-keyword" hint="같은 키워드 규칙이 이미 있으면 새로 만들지 않아요.">
                    <TextInput id="transaction-rule-keyword" value={ruleKeyword} onChange={(event) => setRuleKeyword(event.target.value)} placeholder="예: 스타벅스" />
                  </FormField>
                </div>
              )}
            </section>
          )}

          <FormField label="메모" htmlFor="transaction-memo" aside={<span className="text-xs text-muted">{memo.length} / {MEMO_MAX_LENGTH}</span>}>
            <TextArea
              id="transaction-memo"
              rows={3}
              maxLength={MEMO_MAX_LENGTH}
              value={memo}
              onChange={(event) => setMemo(event.target.value.slice(0, MEMO_MAX_LENGTH))}
              placeholder="이 거래에 남길 메모를 적어 보세요"
            />
          </FormField>

          {error && <p role="alert" className="m-0 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm leading-5 text-danger">{error}</p>}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-5 py-4 sm:px-6">
          {confirmingDelete ? (
            <div role="alertdialog" aria-label="거래 삭제 확인" className="flex w-full flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-heading">이 거래를 삭제할까요? 되돌릴 수 없어요.</span>
              <div className="flex gap-2">
                <Button onClick={() => setConfirmingDelete(false)} disabled={deleting}>취소</Button>
                <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>{deleting ? "삭제 중…" : "삭제"}</Button>
              </div>
            </div>
          ) : (
            <>
              {isEdit ? (
                <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                  삭제
                </Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button onClick={onClose}>취소</Button>
                <Button variant="primary" onClick={() => void handleSave()} disabled={saving || !canSave} className="min-w-[72px]">
                  {saving ? "저장 중…" : isEdit ? "저장" : "추가"}
                </Button>
              </div>
            </>
          )}
        </footer>
      </Drawer>

      <NWaySplitDialog
        open={dialog === "n-way"}
        amount={validAmount ?? 0}
        merchant={merchant}
        date={date}
        onClose={() => setDialog("none")}
        onApply={(share) => {
          setAmount(share);
          setSplits([]);
          setDialog("none");
        }}
      />
      <CategorySplitDialog
        open={dialog === "category-split"}
        totalAmount={validAmount ?? 0}
        merchant={merchant}
        categories={categories}
        initialSplits={splits}
        onClose={() => setDialog("none")}
        onApply={(nextSplits) => {
          setSplits(nextSplits);
          setCategoryId(null);
          setCreateRule(false);
          setDialog("none");
        }}
      />
    </>
  );
}
