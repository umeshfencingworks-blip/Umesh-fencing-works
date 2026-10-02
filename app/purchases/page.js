import { redirect } from "next/navigation";

export default function PurchasesRedirect() {
  redirect("/admin-controls?tab=purchase-ledger");
}
