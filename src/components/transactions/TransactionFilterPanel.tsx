import { Search } from "lucide-react";
import CategoryChipPicker from "@/components/transactions/CategoryChipPicker";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import TextInput from "@/components/ui/TextInput";
import type { TransactionFilters } from "@/lib/transactions/summary";
import type { Category, PaymentType } from "@/lib/types";

type PaymentFilter = "all" | PaymentType;

interface TransactionFilterPanelProps {
  id: string;
  categories: Category[];
  filters: TransactionFilters;
  onChange: (patch: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

export default function TransactionFilterPanel({ id, categories, filters, onChange, onReset }: TransactionFilterPanelProps) {
  return (
    <div id={id} className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] leading-[18px] font-semibold text-sub">내역 검색</span>
        <TextInput type="search" value={filters.query} onChange={(event) => onChange({ query: event.target.value })} placeholder="가맹점 또는 메모" icon={<Search size={16} strokeWidth={2} />} />
      </label>
      <div className="flex flex-col gap-2">
        <span id={`${id}-category`} className="text-[13px] leading-[18px] font-semibold text-sub">카테고리</span>
        <CategoryChipPicker labelledBy={`${id}-category`} categories={categories} value={filters.categoryId} onChange={(categoryId) => onChange({ categoryId })} emptyLabel="전체" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] leading-[18px] font-semibold text-sub">결제 방식</span>
        <SegmentedControl<PaymentFilter>
          label="결제 방식"
          stretch
          value={filters.paymentType ?? "all"}
          onChange={(value) => onChange({ paymentType: value === "all" ? null : value })}
          options={[
            { value: "all", label: "전체" },
            { value: "CARD", label: "카드" },
            { value: "POINT", label: "포인트" },
            { value: "MIXED", label: "혼합" },
          ]}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onReset}>필터 초기화</Button>
      </div>
    </div>
  );
}
