import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import DetailRiwayatView from "@/views/Psikolog/RiwayatPesanan/DetailRiwayat";

export default function DetailRiwayatPage() {

  return <DetailRiwayatView/>;
}