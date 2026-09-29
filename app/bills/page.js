import BillsView from "@/components/views/BillsView";

export const metadata = {
  title: "Retail & Counter Bills — Umesh Fencing Works",
};

export default function BillsPage() {
  return <BillsView autoOpenCreate={false} />;
}
