import {
  CarFront,
  CircleHelp,
  Clapperboard,
  Ellipsis,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  ReceiptText,
  ShoppingBag,
  Split,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { parentCategoryName } from "@/lib/transactionDisplay";
import type { Transaction } from "@/lib/types";

type IconTone = "blue" | "green" | "amber" | "orange" | "violet" | "teal" | "indigo" | "rose" | "slate";

const toneClass: Record<IconTone, string> = {
  blue: "bg-primary-soft text-primary-soft-text",
  green: "bg-positive-soft text-positive",
  amber: "bg-pending-soft text-pending",
  orange: "bg-mixed-soft text-mixed",
  violet: "bg-point-soft text-point",
  teal: "bg-tone-teal-soft text-tone-teal",
  indigo: "bg-tone-indigo-soft text-tone-indigo",
  rose: "bg-danger-soft text-danger",
  slate: "bg-subtle text-sub",
};

const parentAppearance: Record<string, { icon: LucideIcon; tone: IconTone }> = {
  식비: { icon: UtensilsCrossed, tone: "blue" },
  생활: { icon: House, tone: "violet" },
  교통: { icon: CarFront, tone: "indigo" },
  의료: { icon: HeartPulse, tone: "rose" },
  쇼핑: { icon: ShoppingBag, tone: "teal" },
  "취미·여가": { icon: Clapperboard, tone: "orange" },
  교육: { icon: GraduationCap, tone: "blue" },
  금융: { icon: Landmark, tone: "slate" },
  기타: { icon: Ellipsis, tone: "slate" },
};

function resolveAppearance(transaction: Transaction): { icon: LucideIcon; tone: IconTone } {
  if (transaction.type === "INCOME") return { icon: ReceiptText, tone: "green" };
  if (transaction.splits?.length) return { icon: Split, tone: "indigo" };
  const parentName = parentCategoryName(transaction.category);
  if (!parentName) return { icon: CircleHelp, tone: "amber" };
  return parentAppearance[parentName] ?? { icon: Tag, tone: "slate" };
}

export default function CategoryIcon({ transaction }: { transaction: Transaction }) {
  const { icon: Icon, tone } = resolveAppearance(transaction);
  return (
    <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}>
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}
