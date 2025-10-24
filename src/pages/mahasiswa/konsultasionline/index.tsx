import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import KonsultasiOnlineMahasiswa from '@/views/Mahasiswa/KonsultasiOnline';

export default function KonsultasiOnlinePage() {
  return (
    <>
      <KonsultasiOnlineMahasiswa />
    </>
  );
}
