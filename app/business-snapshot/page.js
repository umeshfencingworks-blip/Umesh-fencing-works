import { redirect } from "next/navigation";

export default function BusinessSnapshotRedirect() {
  redirect("/admin-controls?tab=snapshot");
}
