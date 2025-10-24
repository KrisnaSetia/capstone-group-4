import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import KonsultasiOfflineMahasiswa from '@/views/Mahasiswa/KonsultasiOffline';

export default function KonsultasiOfflinePage() {
  return (
    <>
      <KonsultasiOfflineMahasiswa />
    </>
  );
}
