import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import FormKonsultasiOffline from '@/views/Mahasiswa/KonsultasiOffline/DaftarKonsultasi';

export default function DaftarKonsultasiOfflinePage() {
  return (
    <>
      <FormKonsultasiOffline />
    </>
  );
}
