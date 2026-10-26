import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetchJson";

export interface MailImportLogItem {
  id: number;
  statementMonth: string | null;
  rowCount: number | null;
  duplicateUpload: boolean;
  createdAt: string;
}

interface MailImportsResponse {
  enabled: boolean;
  logs: MailImportLogItem[];
}

type MailImportsState = { status: "loading" } | { status: "error" } | { status: "ready"; data: MailImportsResponse };

export function useMailImports() {
  const [state, setState] = useState<MailImportsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchJson<MailImportsResponse>("/api/mail-imports")
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
