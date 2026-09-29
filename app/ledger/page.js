import { redirect } from "next/navigation";

export default function LedgerRedirect() {
  redirect("/admin-controls?tab=financial-ledger");
}
