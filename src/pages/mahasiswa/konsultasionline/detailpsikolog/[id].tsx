import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import DetailPsikologView from "@/views/Mahasiswa/KonsultasiOnline/DetailPsikolog";

export default function DetailPsikologPage() {
  return <DetailPsikologView />;
}