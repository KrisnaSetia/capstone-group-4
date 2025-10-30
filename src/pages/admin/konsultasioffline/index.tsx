import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [2]); // Role admin = 2
import KonsultasiOfflineAdminPage from "@/views/Admin/KonsultasiOffline";

export default function KonsultasiOfflineAdmin() {
  return (
    <>
      <KonsultasiOfflineAdminPage />
    </>
  );
}
