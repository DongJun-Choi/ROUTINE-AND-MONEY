import type { SelectHTMLAttributes } from "react";
import Select from "@/components/ui/Select";
import type { Category } from "@/lib/types";

interface CategorySelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
  emptyLabel: string;
  emptyDisabled?: boolean;
}

export default function CategorySelect({ categories, value, onChange, emptyLabel, emptyDisabled = false, ...props }: CategorySelectProps) {
  const parents = categories.filter((category) => category.parentId === null);

  return (
    <Select value={value ?? ""} onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)} {...props}>
      <option value="" disabled={emptyDisabled}>{emptyLabel}</option>
      {parents.map((parent) => (
        <optgroup key={parent.id} label={parent.name}>
          <option value={parent.id}>{parent.name}</option>
          {categories.filter((category) => category.parentId === parent.id).map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
