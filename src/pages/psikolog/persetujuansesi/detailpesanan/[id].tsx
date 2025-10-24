import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import DetailPesananView from "@/views/Psikolog/PersetujuanSesi/DetailPesanan";

export default function DetailPesananPage() {

  return <DetailPesananView />;
}
