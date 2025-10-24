import { withAuthSSR, AuthUser } from "@/lib/auth";
import DashboardMahasiswa from "@/views/DashboardPage/Mahasiswa";
export const getServerSideProps = withAuthSSR(
  async () => {
    return {
      props: {},
    };
  },
  [1] // Role mahasiswa
);

export default function MahasiswaDashboardPage({ user }: { user: AuthUser }) {
  return <DashboardMahasiswa user={user}/>;
}
