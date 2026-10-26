"use client";

import { Check, Info, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import CategoryMoveDialog from "@/components/category/CategoryMoveDialog";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconButton from "@/components/ui/IconButton";
import TextInput from "@/components/ui/TextInput";
import ToggleChip from "@/components/ui/ToggleChip";
import { createSubcategory, deleteCategory, isDuplicateCategoryName, renameCategory } from "@/lib/categories/api";
import { formatNumber } from "@/lib/format";
import type { Category } from "@/lib/types";

interface CategoryManagerCardProps {
  categories: Category[];
  usage: Map<number, number> | null;
  status: "loading" | "ready" | "error";
  onChanged: () => void;
  className?: string;
}

const sectionLabelClass = "m-0 text-[13px] leading-[18px] font-semibold text-muted";
const errorTextClass = "m-0 text-xs leading-[18px] text-danger";
const DUPLICATE_NAME_MESSAGE = "같은 이름의 카테고리가 이미 있어요. 카테고리 이름은 대분류와 상관없이 겹칠 수 없어요.";

interface SubcategoryRowProps {
  category: Category;
  usageCount: number | null;
  categories: Category[];
  onRenamed: () => void;
  onDelete: () => void;
}

function SubcategoryRow({ category, usageCount, categories, onRenamed, onDelete }: SubcategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setEditing(false);
    setName(category.name);
    setError(null);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("이름을 입력해 주세요.");
    if (trimmed === category.name) return cancel();
    if (isDuplicateCategoryName(categories, trimmed, category.id)) return setError(DUPLICATE_NAME_MESSAGE);
    setSaving(true);
    const result = await renameCategory(category.id, trimmed);
    setSaving(false);
    if (!result.ok) return setError(result.message);
    setEditing(false);
    setError(null);
    onRenamed();
  };

  return (
    <li className="flex flex-col gap-1 border-t border-subtle py-1.5 pr-1.5 pl-4 first:border-t-0">
      {editing ? (
        <form onSubmit={(event) => void save(event)} className="flex items-center gap-1.5">
          <TextInput
            aria-label={`${category.name}의 새 이름`}
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel();
            }}
            wrapperClassName="min-w-0 flex-1"
            className="text-sm"
          />
          <IconButton type="submit" label="새 이름 저장" disabled={saving}><Check size={18} strokeWidth={2} aria-hidden="true" /></IconButton>
          <IconButton label="이름 바꾸기 취소" onClick={cancel}><X size={18} strokeWidth={2} aria-hidden="true" /></IconButton>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm leading-5 font-semibold text-heading">{category.name}</span>
          {usageCount !== null && <span className="text-xs whitespace-nowrap text-muted">거래 {formatNumber(usageCount)}건</span>}
          <IconButton label={`${category.name} 이름 바꾸기`} onClick={() => setEditing(true)}><Pencil size={18} strokeWidth={1.8} aria-hidden="true" /></IconButton>
          <IconButton label={`${category.name} 삭제`} tone="danger" onClick={onDelete}><Trash2 size={18} strokeWidth={1.8} aria-hidden="true" /></IconButton>
        </div>
      )}
      {error && <p role="alert" className={`${errorTextClass} pb-1`}>{error}</p>}
    </li>
  );
}

export default function CategoryManagerCard({ categories, usage, status, onChanged, className = "" }: CategoryManagerCardProps) {
  const parents = categories.filter((category) => category.parentId === null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const activeParent = parents.find((parent) => parent.id === selectedParentId) ?? parents[0] ?? null;
  const children = activeParent ? categories.filter((category) => category.parentId === activeParent.id) : [];

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ category: Category; usedCount: number } | null>(null);

  const addSubcategory = async (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!activeParent || !name) return;
    if (isDuplicateCategoryName(categories, name)) return setAddError(DUPLICATE_NAME_MESSAGE);
    setAdding(true);
    setAddError(null);
    const result = await createSubcategory(name, activeParent.id);
    setAdding(false);
    if (!result.ok) return setAddError(result.message);
    setNewName("");
    onChanged();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteCategory(deleteTarget.id);
    setDeleting(false);
    if (result.status === "deleted") {
      setDeleteTarget(null);
      onChanged();
    } else if (result.status === "in-use") {
      setMoveTarget({ category: deleteTarget, usedCount: result.usedCount });
      setDeleteTarget(null);
    } else {
      setDeleteError(result.message);
    }
  };

  return (
    <Card className={`gap-5 ${className}`}>
      <CardHeader title="카테고리 관리" description="대분류는 고정이고, 그 아래 소분류를 추가하거나 이름을 바꿀 수 있어요." />

      {status === "error" && categories.length === 0 ? (
        <p role="alert" className="m-0 text-sm text-danger">카테고리를 불러오지 못했어요.</p>
      ) : status === "loading" && categories.length === 0 ? (
        <div aria-hidden="true" className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((index) => <div key={index} className="h-11 w-20 animate-pulse rounded-full bg-subtle" />)}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            <h3 id="parent-category-label" className={sectionLabelClass}>대분류</h3>
            <div role="group" aria-labelledby="parent-category-label" className="flex flex-wrap gap-2">
              {parents.map((parent) => (
                <ToggleChip key={parent.id} variant="solid" active={activeParent?.id === parent.id} onClick={() => setSelectedParentId(parent.id)} className="min-h-11">
                  {parent.name}
                </ToggleChip>
              ))}
            </div>
          </div>

          {activeParent && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className={sectionLabelClass}>{activeParent.name}의 소분류</h3>
                <span className="text-xs text-muted">{children.length}개</span>
              </div>
              {children.length === 0 ? (
                <p className="m-0 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">아직 소분류가 없어요. 아래에서 추가해 보세요.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col rounded-xl border border-subtle p-0">
                  {children.map((child) => (
                    <SubcategoryRow
                      key={child.id}
                      category={child}
                      categories={categories}
                      usageCount={usage ? usage.get(child.id) ?? 0 : null}
                      onRenamed={onChanged}
                      onDelete={() => {
                        setDeleteError(null);
                        setDeleteTarget(child);
                      }}
                    />
                  ))}
                </ul>
              )}
              <form onSubmit={(event) => void addSubcategory(event)} className="flex gap-2">
                <TextInput
                  aria-label={`${activeParent.name}에 추가할 소분류 이름`}
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setAddError(null);
                  }}
                  placeholder="새 소분류 이름"
                  wrapperClassName="min-w-0 flex-1"
                />
                <Button type="submit" variant="primary" disabled={adding || !newName.trim()}>{adding ? "추가 중…" : "추가"}</Button>
              </form>
              {addError && <p role="alert" className={errorTextClass}>{addError}</p>}
            </div>
          )}
        </>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised px-3.5 py-3 text-[13px] leading-5 text-sub">
        <Info size={18} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0 text-primary-text" />
        <p className="m-0">거래가 연결된 소분류를 지우면, 그 거래를 다른 소분류로 옮기거나 미분류로 둘지 먼저 고르게 돼요.</p>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="소분류 삭제"
        description={deleteTarget && <>‘{deleteTarget.name}’ 소분류를 삭제할까요? 이 소분류에 걸린 자동 분류 규칙도 함께 지워져요.</>}
        confirmLabel="삭제"
        destructive
        busy={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
      <CategoryMoveDialog
        open={moveTarget !== null}
        category={moveTarget?.category ?? null}
        usedCount={moveTarget?.usedCount ?? 0}
        siblings={moveTarget ? categories.filter((category) => category.parentId === moveTarget.category.parentId && category.id !== moveTarget.category.id) : []}
        onClose={() => setMoveTarget(null)}
        onDone={() => {
          setMoveTarget(null);
          onChanged();
        }}
      />
    </Card>
  );
}
