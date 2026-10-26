"use client";

import { ArrowRight, Check, Pencil, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import CategorySelect from "@/components/category/CategorySelect";
import Button from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FormField from "@/components/ui/FormField";
import IconButton from "@/components/ui/IconButton";
import TextInput from "@/components/ui/TextInput";
import { addCategoryRule, deleteCategoryRule, updateCategoryRule, type CategoryRule } from "@/lib/categories/api";
import { filterRules } from "@/lib/categories/rules";
import { formatNumber } from "@/lib/format";
import { categoryPathById } from "@/lib/transactionDisplay";
import type { Category } from "@/lib/types";

interface CategoryRulesCardProps {
  categories: Category[];
  rules: CategoryRule[];
  status: "loading" | "ready" | "error";
  onChanged: () => void;
  className?: string;
}

const errorTextClass = "m-0 text-xs leading-[18px] text-danger";

interface RuleRowProps {
  rule: CategoryRule;
  categories: Category[];
  onSaved: () => void;
  onDelete: () => void;
}

function RuleRow({ rule, categories, onSaved, onDelete }: RuleRowProps) {
  const [editing, setEditing] = useState(false);
  const [keyword, setKeyword] = useState(rule.keyword);
  const [categoryId, setCategoryId] = useState<number | null>(rule.categoryId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const path = categoryPathById(categories, rule.categoryId) ?? "삭제된 카테고리";

  const cancel = () => {
    setEditing(false);
    setKeyword(rule.keyword);
    setCategoryId(rule.categoryId);
    setError(null);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!keyword.trim() || categoryId === null) return setError("키워드와 카테고리를 모두 정해 주세요.");
    setSaving(true);
    const result = await updateCategoryRule(rule.id, keyword.trim(), categoryId);
    setSaving(false);
    if (!result.ok) return setError(result.message);
    setEditing(false);
    setError(null);
    onSaved();
  };

  return (
    <li className="flex flex-col gap-1 border-t border-subtle py-1.5 pr-1.5 pl-4 first:border-t-0">
      {editing ? (
        <form onSubmit={(event) => void save(event)} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 py-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <TextInput aria-label="규칙 키워드" value={keyword} autoFocus onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") cancel(); }} className="text-sm" />
          <CategorySelect aria-label="규칙 카테고리" categories={categories} value={categoryId} onChange={setCategoryId} emptyLabel="카테고리 선택" emptyDisabled className="col-span-3 row-start-2 sm:col-span-1 sm:row-start-1" />
          <IconButton type="submit" label="규칙 저장" disabled={saving}><Check size={18} strokeWidth={2} aria-hidden="true" /></IconButton>
          <IconButton label="규칙 고치기 취소" onClick={cancel}><X size={18} strokeWidth={2} aria-hidden="true" /></IconButton>
        </form>
      ) : (
        <div className="flex items-center gap-2.5">
          <span className="max-w-[45%] truncate text-sm leading-5 font-semibold text-heading">{rule.keyword}</span>
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" className="shrink-0 text-muted" />
          <span className="sr-only">분류:</span>
          <span className="min-w-0 flex-1 overflow-hidden"><Chip size="md">{path}</Chip></span>
          <IconButton label={`${rule.keyword} 규칙 고치기`} onClick={() => setEditing(true)}><Pencil size={18} strokeWidth={1.8} aria-hidden="true" /></IconButton>
          <IconButton label={`${rule.keyword} 규칙 삭제`} tone="danger" onClick={onDelete}><Trash2 size={18} strokeWidth={1.8} aria-hidden="true" /></IconButton>
        </div>
      )}
      {error && <p role="alert" className={`${errorTextClass} pb-1`}>{error}</p>}
    </li>
  );
}

export default function CategoryRulesCard({ categories, rules, status, onChanged, className = "" }: CategoryRulesCardProps) {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const visibleRules = useMemo(() => filterRules(rules, categories, query, filterCategoryId), [rules, categories, query, filterCategoryId]);
  const isFiltered = query.trim() !== "" || filterCategoryId !== null;

  const addRule = async (event: FormEvent) => {
    event.preventDefault();
    if (!keyword.trim() || categoryId === null) return;
    setAdding(true);
    setAddError(null);
    const result = await addCategoryRule(keyword.trim(), categoryId);
    setAdding(false);
    if (!result.ok) return setAddError(result.message);
    setKeyword("");
    onChanged();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteCategoryRule(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) return setDeleteError(result.message);
    setDeleteTarget(null);
    onChanged();
  };

  return (
    <Card className={`gap-5 ${className}`}>
      <CardHeader title="자동 분류 규칙" description="명세서를 가져올 때 가맹점 이름에 키워드가 들어 있으면 그 카테고리로 분류해요. 띄어쓰기·기호·영문 대소문자는 무시해요." />

      <form onSubmit={(event) => void addRule(event)} className="flex flex-col gap-2 rounded-xl border border-line bg-raised p-4">
        <div className="flex flex-wrap items-end gap-2.5">
          <FormField label="키워드" htmlFor="rule-keyword" className="flex-[1_1_160px]">
            <TextInput id="rule-keyword" value={keyword} onChange={(event) => { setKeyword(event.target.value); setAddError(null); }} placeholder="예: 스타벅스" />
          </FormField>
          <FormField label="카테고리" htmlFor="rule-category" className="flex-[1_1_180px]">
            <CategorySelect id="rule-category" categories={categories} value={categoryId} onChange={(value) => { setCategoryId(value); setAddError(null); }} emptyLabel="카테고리 선택" emptyDisabled />
          </FormField>
          <Button type="submit" variant="primary" disabled={adding || !keyword.trim() || categoryId === null}>{adding ? "추가 중…" : "규칙 추가"}</Button>
        </div>
        {addError && <p role="alert" className={errorTextClass}>{addError}</p>}
      </form>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 text-[13px] leading-[18px] font-semibold text-muted">현재 규칙</h3>
          <span className="text-xs text-muted">{isFiltered ? `${formatNumber(visibleRules.length)} / ${formatNumber(rules.length)}개` : `${formatNumber(rules.length)}개`}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <TextInput type="search" aria-label="규칙 키워드 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="키워드 검색" icon={<Search size={16} strokeWidth={2} />} wrapperClassName="flex-[1_1_180px]" />
          <CategorySelect aria-label="카테고리로 규칙 거르기" categories={categories} value={filterCategoryId} onChange={setFilterCategoryId} emptyLabel="모든 카테고리" className="flex-[1_1_160px]" />
        </div>

        {status === "error" && rules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm">
            <p className="m-0 text-danger">자동 분류 규칙을 불러오지 못했어요.</p>
            <Button onClick={onChanged}>다시 시도</Button>
          </div>
        ) : status === "loading" && rules.length === 0 ? (
          <p className="m-0 rounded-xl border border-subtle px-4 py-8 text-center text-sm text-muted">규칙을 불러오는 중이에요…</p>
        ) : visibleRules.length === 0 ? (
          <p className="m-0 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
            {isFiltered ? "조건에 맞는 규칙이 없어요." : "아직 규칙이 없어요. 위에서 키워드와 카테고리를 골라 추가해 보세요."}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col rounded-xl border border-subtle p-0">
            {visibleRules.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                categories={categories}
                onSaved={onChanged}
                onDelete={() => {
                  setDeleteError(null);
                  setDeleteTarget(rule);
                }}
              />
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="규칙 삭제"
        description={deleteTarget && <>‘{deleteTarget.keyword}’ 규칙을 삭제할까요? 이미 분류된 거래의 카테고리는 바뀌지 않아요.</>}
        confirmLabel="삭제"
        destructive
        busy={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </Card>
  );
}
