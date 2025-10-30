import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [2]); // Role admin = 2
import ManajemenPsikologAdminPage from "@/views/Admin/ManajemenPsikolog";

export default function ManajemenPsikologAdmin() {
  return (
    <>
      <ManajemenPsikologAdminPage />
    </>
  );
}
