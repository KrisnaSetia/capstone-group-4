import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import DetailRiwayatView from "@/views/Mahasiswa/RiwayatPesanan/DetailRiwayat";

export default function DetailRiwayatPage() {

  return <DetailRiwayatView />;
}