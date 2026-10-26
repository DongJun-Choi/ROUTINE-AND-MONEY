export type PaymentType = "CARD" | "POINT" | "MIXED";
export type TransactionType = "INCOME" | "EXPENSE";

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface CategoryWithParent extends Category {
  parent?: { id: number; name: string } | null;
}

export interface TransactionSplit {
  id: number;
  amount: number;
  label?: string | null;
  categoryId: number | null;
  category?: CategoryWithParent | null;
}

export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  paymentType: PaymentType;
  type: TransactionType;
  categoryId: number | null;
  memo?: string | null;
  category?: CategoryWithParent | null;
  splits?: TransactionSplit[];
}
