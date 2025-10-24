import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import RiwayatPesananMahasiswa from '@/views/Mahasiswa/RiwayatPesanan';

export default function RiwayatPesananMahasiswaPage() {
  return (
    <>
      <RiwayatPesananMahasiswa />
    </>
  );
}