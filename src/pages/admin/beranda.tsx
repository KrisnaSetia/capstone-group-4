// pages/psikolog/beranda.tsx
import { withAuthSSR, AuthUser } from "@/lib/auth";
import DashboardAdmin from "@/views/DashboardPage/Admin";

export const getServerSideProps = withAuthSSR(
  async () => {
    return {
      props: {},
    };
  },
  [2] // Role admin
);

export default function PsikologDashboardPage({ user }: { user: AuthUser }) {
  return <DashboardAdmin />;
}
