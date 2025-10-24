import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import PilihPsikolog from '@/views/Mahasiswa/KonsultasiOnline/PilihPsikolog';

export default function PilihPsikologPage() {
  return (
    <>
      <PilihPsikolog />
    </>
  );
}
