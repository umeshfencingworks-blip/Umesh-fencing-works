import BillsView from "@/components/views/BillsView";

export const metadata = {
  title: "Create Counter Bill — Umesh Fencing Works",
};

export default function CreateBillPage() {
  return <BillsView autoOpenCreate={true} />;
}
