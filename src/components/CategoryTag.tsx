"use client";

interface CategoryTagProps {
  name: string | null;
  parentName?: string | null;
  onClick?: () => void;
}

const parentCategoryColors: Record<string, string> = {
  "식비": "bg-red-100 text-red-600",
  "생활": "bg-green-100 text-green-600",
  "교통": "bg-blue-100 text-blue-600",
  "의료": "bg-purple-100 text-purple-600",
  "쇼핑": "bg-pink-100 text-pink-600",
  "취미·여가": "bg-orange-100 text-orange-600",
  "교육": "bg-indigo-100 text-indigo-600",
  "금융": "bg-yellow-100 text-yellow-700",
  "기타": "bg-gray-200 text-gray-600",
};

export default function CategoryTag({ name, parentName, onClick }: CategoryTagProps) {
  if (!name) {
    return (
      <span
        onClick={onClick}
        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 cursor-pointer"
      >
        미분류
      </span>
    );
  }

  const colorStyle = parentCategoryColors[parentName ?? ""] 
    ?? "bg-gray-100 text-gray-600";

  return (
    <span
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded cursor-pointer ${colorStyle}`}
    >
      {name}
    </span>
  );
}