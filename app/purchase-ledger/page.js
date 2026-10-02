import { redirect } from "next/navigation";

export default function PurchaseLedgerRedirect() {
  redirect("/admin-controls?tab=purchase-ledger");
}
