"use client";

import { useState } from "react";
import CategoryManagerCard from "@/components/category/CategoryManagerCard";
import CategoryRulesCard from "@/components/category/CategoryRulesCard";
import { useCategoryList, useCategoryRules, useCategoryUsage } from "@/components/category/useCategoryData";
import PageHeader from "@/components/ui/PageHeader";

export default function CategorySettingsPage() {
  // 소분류를 지우면 그 소분류의 규칙도 함께 지워지므로, 카테고리가 바뀌면 규칙 목록도 다시 불러온다.
  const [categoryVersion, setCategoryVersion] = useState(0);
  const [ruleVersion, setRuleVersion] = useState(0);
  const { status: categoryStatus, categories } = useCategoryList(categoryVersion);
  const usage = useCategoryUsage(categoryVersion);
  const { status: ruleStatus, rules } = useCategoryRules(categoryVersion + ruleVersion);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="카테고리" description="대분류와 소분류를 정리하고, 가맹점 키워드로 자동 분류 규칙을 만들어요." />
      <div className="flex flex-wrap items-start gap-6">
        <CategoryManagerCard
          className="flex-[1_1_460px]"
          categories={categories}
          usage={usage}
          status={categoryStatus}
          onChanged={() => setCategoryVersion((version) => version + 1)}
        />
        <CategoryRulesCard
          className="flex-[1_1_460px]"
          categories={categories}
          rules={rules}
          status={ruleStatus}
          onChanged={() => setRuleVersion((version) => version + 1)}
        />
      </div>
    </div>
  );
}
