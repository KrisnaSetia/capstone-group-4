import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [2]); // Role admin = 2
import DetailPsikologAdminView from "@/views/Admin/ManajemenPsikolog/DetailPsikolog";

export default function DetailPsikologAdminPage() {
  return <DetailPsikologAdminView />;
}