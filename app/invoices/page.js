import InvoicesView from "@/components/views/InvoicesView";

export const metadata = {
  title: "GST Tax Invoices — Umesh Fencing Works",
};

export default function InvoicesPage() {
  return <InvoicesView autoOpenCreate={false} />;
}
