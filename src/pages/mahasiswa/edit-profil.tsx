import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [1]); // Role mahasiswa = 1
import EditProfilMahasiswa from '@/views/Mahasiswa/EditProfil';

export default function EditProfilPage() {
  return (
    <>
      <EditProfilMahasiswa />
    </>
  );
}
