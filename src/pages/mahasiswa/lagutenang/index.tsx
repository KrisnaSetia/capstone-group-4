import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import LaguTenang from '@/views/Mahasiswa/LaguTenang';

export default function LaguTenangPage() {
  return (
    <LaguTenang />
  );
}