"use client";

import { Check, Pencil, Search, Trash2, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Category { id: number; name: string; parentId: number | null }
interface CategoryRule { id: number; keyword: string; category?: Category | null }

export default function CategoryRuleManager() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingKeyword, setEditingKeyword] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRules = async () => {
    const response = await fetch("/api/category-rules");
    setRules(await response.json());
  };

  useEffect(() => {
    void loadRules();
    void fetch("/api/categories").then((response) => response.json()).then((data) => setCategories(data.categories));
  }, []);

  const parents = categories.filter((category) => category.parentId === null);
  const childrenByParent = useMemo(() => categories.reduce<Record<number, Category[]>>((result, category) => {
    if (category.parentId !== null) (result[category.parentId] ??= []).push(category);
    return result;
  }, {}), [categories]);

  const filteredRules = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
    const categoryIds = selectedChild !== null
      ? [selectedChild]
      : selectedParent !== null
        ? [selectedParent, ...(childrenByParent[selectedParent] ?? []).map((category) => category.id)]
        : null;
    return rules.filter((rule) => {
      if (normalizedQuery && !rule.keyword.toLocaleLowerCase("ko-KR").includes(normalizedQuery)) return false;
      if (categoryIds && !categoryIds.includes(rule.category?.id ?? -1)) return false;
      return true;
    });
  }, [rules, query, selectedParent, selectedChild, childrenByParent]);

  const startEditing = (rule: CategoryRule) => {
    setEditingId(rule.id);
    setEditingKeyword(rule.keyword);
    setEditingCategoryId(rule.category?.id ?? null);
  };

  const saveRule = async () => {
    if (!editingId || !editingKeyword.trim() || !editingCategoryId) return;
    setSaving(true);
    const response = await fetch(`/api/category-rules/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: editingKeyword.trim(), categoryId: editingCategoryId }),
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      alert(result?.error ?? "규칙 수정에 실패했습니다.");
      return;
    }
    setEditingId(null);
    await loadRules();
  };

  const deleteRule = async (rule: CategoryRule) => {
    if (!window.confirm(`자동 분류 규칙을 삭제하시겠습니까?\n\n"${rule.keyword}" → ${rule.category?.name ?? "미분류"}`)) return;
    const response = await fetch(`/api/category-rules/${rule.id}`, { method: "DELETE" });
    if (!response.ok) { alert("규칙 삭제에 실패했습니다."); return; }
    await loadRules();
  };

  return (
    <section className="category-center-panel rule-center-panel">
      <div className="rule-panel-heading"><div><h2><WandSparkles size={20} />자동 분류 규칙 관리</h2><p>새 규칙은 지출 내역에서 카테고리를 지정할 때 만들 수 있습니다.</p></div></div>
      <div className="rule-builder rule-filter-builder">
        <div>
          <span>대분류</span>
          <div className="rule-pills">
            <button className={selectedParent === null ? "selected" : ""} onClick={() => { setSelectedParent(null); setSelectedChild(null); }}>전체</button>
            {parents.map((parent) => <button key={parent.id} className={selectedParent === parent.id ? "selected" : ""} onClick={() => { setSelectedParent(parent.id); setSelectedChild(null); }}>{parent.name}</button>)}
          </div>
        </div>
        <div>
          <span>하위 카테고리</span>
          {selectedParent === null ? <p className="rule-placeholder">대분류를 선택하세요.</p> : (
            <div className="rule-pills child">
              <button className={selectedChild === null ? "selected" : ""} onClick={() => setSelectedChild(null)}>전체</button>
              {(childrenByParent[selectedParent] ?? []).map((child) => <button key={child.id} className={selectedChild === child.id ? "selected" : ""} onClick={() => setSelectedChild(child.id)}>{child.name}</button>)}
            </div>
          )}
        </div>
        <label className="rule-search-field">
          규칙 검색
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="키워드 검색" className="w-full rounded-xl border border-gray-200 py-2.5 text-sm outline-none focus:border-violet-400" />
          </span>
        </label>
      </div>
      <div className="rule-list-section">
        <h3>검색 결과 <span>{filteredRules.length}개</span></h3>
        {filteredRules.length === 0 ? <div className="rule-empty">조건에 맞는 자동 분류 규칙이 없습니다.</div> : (
          <ul className="rule-list">{filteredRules.map((rule) => (
            <li key={rule.id}>
              {editingId === rule.id ? (
                <div className="grid w-full gap-2 md:grid-cols-[minmax(0,1fr)_200px_auto]">
                  <input value={editingKeyword} onChange={(event) => setEditingKeyword(event.target.value)} className="rounded-lg border border-violet-300 px-3 py-2 text-sm outline-none" aria-label="규칙 키워드" />
                  <select value={editingCategoryId ?? ""} onChange={(event) => setEditingCategoryId(Number(event.target.value))} className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm" aria-label="규칙 카테고리">
                    <option value="" disabled>카테고리 선택</option>
                    {parents.map((parent) => <optgroup key={parent.id} label={parent.name}><option value={parent.id}>{parent.name}</option>{(childrenByParent[parent.id] ?? []).map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</optgroup>)}
                  </select>
                  <div className="flex justify-end gap-1"><button onClick={() => void saveRule()} disabled={saving} aria-label="규칙 수정 저장"><Check size={16} /></button><button onClick={() => setEditingId(null)} aria-label="규칙 수정 취소"><X size={16} /></button></div>
                </div>
              ) : <><div><strong>{rule.keyword}</strong><span>{rule.category?.name ?? "미분류"}</span></div><div className="flex gap-1"><button onClick={() => startEditing(rule)} aria-label={`${rule.keyword} 규칙 수정`}><Pencil size={16} /></button><button onClick={() => void deleteRule(rule)} aria-label={`${rule.keyword} 규칙 삭제`}><Trash2 size={16} /></button></div></>}
            </li>
          ))}</ul>
        )}
      </div>
    </section>
  );
}
