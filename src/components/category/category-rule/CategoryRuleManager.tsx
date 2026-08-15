"use client";

import { Plus, Trash2, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Category { id: number; name: string; parentId: number | null }
interface CategoryRule { id: number; keyword: string; category?: Category | null }

export default function CategoryRuleManager() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  const loadRules = async () => { const res = await fetch("/api/category-rules"); setRules(await res.json()); };
  const loadCategories = async () => { const res = await fetch("/api/categories"); const data = await res.json(); setCategories(data.categories); };
  useEffect(() => { void loadRules(); void loadCategories(); }, []);

  const parents = categories.filter((category) => category.parentId === null);
  const children = categories.filter((category) => category.parentId === selectedParent);
  const addRule = async () => { if (!keyword.trim() || !selectedChild) return; await fetch("/api/category-rules/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword: keyword.trim().toLowerCase(), categoryId: selectedChild }) }); setKeyword(""); setSelectedParent(null); setSelectedChild(null); await loadRules(); };
  const deleteRule = async (rule: CategoryRule) => { if (!window.confirm(`자동 분류 규칙을 삭제하시겠습니까?\n\n"${rule.keyword}" → ${rule.category?.name ?? "미분류"}`)) return; await fetch(`/api/category-rules/${rule.id}`, { method: "DELETE" }); await loadRules(); };

  return <section className="category-center-panel rule-center-panel"><div className="rule-panel-heading"><div><h2><WandSparkles size={20} />자동 분류 규칙</h2><p>가맹점 이름에 키워드가 포함되면 선택한 카테고리로 자동 분류합니다.</p></div></div><div className="rule-builder"><label>가맹점 키워드<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="예: 스타벅스" /></label><div><span>대분류</span><div className="rule-pills">{parents.map((parent) => <button key={parent.id} className={selectedParent === parent.id ? "selected" : ""} onClick={() => { setSelectedParent(parent.id); setSelectedChild(null); }}>{parent.name}</button>)}</div></div><div><span>하위 카테고리</span>{selectedParent ? <div className="rule-pills child">{children.map((child) => <button key={child.id} className={selectedChild === child.id ? "selected" : ""} onClick={() => setSelectedChild(child.id)}>{child.name}</button>)}</div> : <p className="rule-placeholder">대분류를 먼저 선택하세요.</p>}</div><button className="rule-add-button" onClick={() => void addRule()} disabled={!keyword.trim() || !selectedChild}><Plus size={17} />규칙 추가</button></div><div className="rule-list-section"><h3>현재 규칙 <span>{rules.length}개</span></h3>{rules.length === 0 ? <div className="rule-empty">등록된 자동 분류 규칙이 없습니다.</div> : <ul className="rule-list">{rules.map((rule) => <li key={rule.id}><div><strong>{rule.keyword}</strong><span>{rule.category?.name ?? "미분류"}</span></div><button onClick={() => void deleteRule(rule)} aria-label={`${rule.keyword} 규칙 삭제`}><Trash2 size={16} /></button></li>)}</ul>}</div></section>;
}
