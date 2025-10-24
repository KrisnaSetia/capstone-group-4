// pages/mahasiswa/konsultasionline/daftarkonsultasionline/index.tsx
import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import FormKonsultasiOnline from '@/views/Mahasiswa/KonsultasiOnline/DaftarKonsultasi';

export default function DaftarKonsultasiOnlinePage() {
  return (
    <>
      <FormKonsultasiOnline />
    </>
  );
}
