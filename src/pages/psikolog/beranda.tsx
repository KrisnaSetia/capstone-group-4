// pages/psikolog/beranda.tsx
import { withAuthSSR, AuthUser } from "@/lib/auth";
import DashboardPsikolog from "@/views/DashboardPage/Psikolog";

export const getServerSideProps = withAuthSSR(
  async () => {
    return {
      props: {},
    };
  },
  [0] // Role psikolog
);

export default function PsikologDashboardPage({ user }: { user: AuthUser }) {
  return <DashboardPsikolog user={user} />;
}
