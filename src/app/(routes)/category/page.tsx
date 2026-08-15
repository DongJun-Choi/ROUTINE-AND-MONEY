"use client";

import { FolderTree, Pencil, Plus, Tags, Trash2, WandSparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import DeleteCategoryModal from "@/components/category/DeleteCategoryModal";
import CategoryRuleManager from "@/components/category/category-rule/CategoryRuleManager";

interface Category { id: number; name: string; parentId: number | null }
type CategoryTab = "categories" | "rules";

function AddChildDialog({ parent, onClose, onAdd }: { parent: Category; onClose: () => void; onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => { if (!name.trim() || saving) return; setSaving(true); await onAdd(name.trim()); setSaving(false); };

  return <div className="category-modal-backdrop" role="presentation"><section className="category-dialog" role="dialog" aria-modal="true" aria-labelledby="add-category-title"><button className="category-dialog-close" onClick={onClose} aria-label="닫기"><X size={18} /></button><h2 id="add-category-title">새 {parent.name} 하위 분류 추가</h2><p>{parent.name}에 포함할 하위 카테고리 이름을 입력하세요.</p><label>하위 카테고리 이름<input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} placeholder={`예: ${parent.name} 세부 항목`} /></label><div className="category-dialog-actions"><button className="secondary" onClick={onClose}>취소</button><button className="primary" onClick={() => void submit()} disabled={!name.trim() || saving}>{saving ? "추가 중..." : "추가"}</button></div></section></div>;
}

function CategoryItem({ category, onUpdate, onDelete }: { category: Category; onUpdate: (id: number, name: string) => Promise<void>; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name);
  const save = async () => { if (!value.trim()) return; await onUpdate(category.id, value.trim()); setEditing(false); };

  return <li className="category-row">{editing ? <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void save(); if (event.key === "Escape") setEditing(false); }} aria-label={`${category.name} 이름`} /> : <strong>{category.name}</strong>}<div>{editing ? <><button onClick={() => void save()}>저장</button><button onClick={() => { setValue(category.name); setEditing(false); }}>취소</button></> : <><button onClick={() => setEditing(true)} aria-label={`${category.name} 수정`}><Pencil size={15} /></button><button className="danger" onClick={onDelete} aria-label={`${category.name} 삭제`}><Trash2 size={15} /></button></>}</div></li>;
}

function CategoryCard({ parent, children, onAdd, onUpdate, onDelete }: { parent: Category; children: Category[]; onAdd: () => void; onUpdate: (id: number, name: string) => Promise<void>; onDelete: (category: Category) => void }) {
  return <article className="category-center-card"><header><div><span className="category-type-badge">{parent.name}</span><span className="category-count">{children.length}개</span></div><button className="small-square" onClick={onAdd} aria-label={`${parent.name} 하위 분류 추가`}><Plus size={18} /></button></header>{children.length === 0 ? <div className="category-card-empty"><p>하위 카테고리가 없습니다.</p><span>오른쪽 위 + 버튼으로 추가해보세요.</span></div> : <ul>{children.map((child) => <CategoryItem key={child.id} category={child} onUpdate={onUpdate} onDelete={() => onDelete(child)} />)}</ul>}</article>;
}

export default function CategorySettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<CategoryTab>("categories");
  const [addTarget, setAddTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [usedCount, setUsedCount] = useState(0);

  const loadCategories = async () => { const res = await fetch("/api/categories"); const data = await res.json(); setCategories(data.categories); };
  useEffect(() => { void loadCategories(); }, []);

  const parents = categories.filter((category) => category.parentId === null);
  const addChild = async (name: string) => { if (!addTarget) return; await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, parentId: addTarget.id }) }); setAddTarget(null); await loadCategories(); };
  const updateCategory = async (id: number, name: string) => { await fetch(`/api/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); await loadCategories(); };
  const requestDelete = async (category: Category) => { if (!window.confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) return; const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" }); const result = await res.json(); if (result.used) { setDeleteTarget(category); setUsedCount(result.usedCount); return; } await loadCategories(); };
  const deleteDirect = async (id: number) => { await fetch(`/api/categories/${id}`, { method: "DELETE" }); await loadCategories(); };
  const moveTransactions = async (newId: number | null) => { if (!deleteTarget) return; const response = await fetch("/api/transactions/move-category", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldId: deleteTarget.id, newId }) }); if (!response.ok) { alert("카테고리 이동 중 오류가 발생했습니다."); return; } await deleteDirect(deleteTarget.id); setDeleteTarget(null); };

  return <div className="category-center-page"><header className="category-center-heading"><FolderTree size={25} /><div><h1>카테고리</h1><p>거래 분류와 자동 분류 규칙을 관리하세요.</p></div></header><div className="category-center-tabs" role="tablist"><button role="tab" aria-selected={activeTab === "categories"} className={activeTab === "categories" ? "selected" : ""} onClick={() => setActiveTab("categories")}><Tags size={16} />카테고리 관리</button><button role="tab" aria-selected={activeTab === "rules"} className={activeTab === "rules" ? "selected" : ""} onClick={() => setActiveTab("rules")}><WandSparkles size={16} />자동 분류 규칙</button></div>{activeTab === "categories" ? <section className="category-center-panel"><h2><Tags size={20} />대분류별 하위 카테고리</h2><p className="category-panel-help">대분류는 고정되어 있으며 하위 카테고리를 추가하거나 이름을 변경할 수 있습니다.</p><div className="category-center-grid">{parents.map((parent) => <CategoryCard key={parent.id} parent={parent} children={categories.filter((category) => category.parentId === parent.id)} onAdd={() => setAddTarget(parent)} onUpdate={updateCategory} onDelete={(category) => void requestDelete(category)} />)}</div></section> : <CategoryRuleManager />}{addTarget && <AddChildDialog parent={addTarget} onClose={() => setAddTarget(null)} onAdd={addChild} />}<DeleteCategoryModal open={Boolean(deleteTarget)} category={deleteTarget} usedCount={usedCount} categories={categories} onClose={() => setDeleteTarget(null)} onMove={(newId: number) => void moveTransactions(newId)} onMoveToNone={() => void moveTransactions(null)} /></div>;
}
