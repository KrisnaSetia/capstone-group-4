import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import DetailPesananView from "@/views/Mahasiswa/KonsultasiOffline/DetailPesanan";

export default function DetailPesananPage() {

  return <DetailPesananView/>;
}
