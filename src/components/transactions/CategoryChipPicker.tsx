import ToggleChip from "@/components/ui/ToggleChip";
import type { Category } from "@/lib/types";

interface CategoryChipPickerProps {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
  emptyLabel: string;
  labelledBy?: string;
  disabled?: boolean;
}

export default function CategoryChipPicker({ categories, value, onChange, emptyLabel, labelledBy, disabled = false }: CategoryChipPickerProps) {
  const parents = categories.filter((category) => category.parentId === null);
  const selected = categories.find((category) => category.id === value) ?? null;
  const activeParent = selected ? categories.find((category) => category.id === (selected.parentId ?? selected.id)) ?? null : null;
  const children = activeParent ? categories.filter((category) => category.parentId === activeParent.id) : [];

  return (
    <div className="flex flex-col gap-2.5">
      <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
        <ToggleChip active={value === null} disabled={disabled} onClick={() => onChange(null)}>{emptyLabel}</ToggleChip>
        {parents.map((parent) => (
          <ToggleChip key={parent.id} active={activeParent?.id === parent.id} disabled={disabled} onClick={() => onChange(parent.id)}>{parent.name}</ToggleChip>
        ))}
      </div>
      {activeParent && children.length > 0 && (
        <div role="group" aria-label={`${activeParent.name} 세부 분류`} className="flex flex-col gap-2 rounded-xl border border-line bg-raised p-3">
          <span className="text-[13px] leading-[18px] text-sub">
            <strong className="font-semibold text-heading">{activeParent.name}</strong> 세부 분류 · 고르지 않으면 대분류로 적용돼요
          </span>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <ToggleChip key={child.id} active={value === child.id} disabled={disabled} onClick={() => onChange(value === child.id ? activeParent.id : child.id)}>{child.name}</ToggleChip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
