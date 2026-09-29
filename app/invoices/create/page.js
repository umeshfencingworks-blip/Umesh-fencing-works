import InvoicesView from "@/components/views/InvoicesView";

export const metadata = {
  title: "Create GST Tax Invoice — Umesh Fencing Works",
};

export default function CreateInvoicePage() {
  return <InvoicesView autoOpenCreate={true} />;
}
