// pages/admin/konsultasioffline/[id].tsx
import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [2]); // role admin = 2

import DetailKonsulOfflineAdminView from "@/views/Admin/KonsultasiOffline/DetailKonsultasi";

export default function DetailKonsultasiOfflineAdminPage() {
  return <DetailKonsulOfflineAdminView />;
}
