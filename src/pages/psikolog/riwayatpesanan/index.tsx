import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import RiwayatPesananPsikolog from '@/views/Psikolog/RiwayatPesanan';

export default function RiwayatPesananPsikologPage() {
  return (
    <>
      <RiwayatPesananPsikolog />
    </>
  );
}