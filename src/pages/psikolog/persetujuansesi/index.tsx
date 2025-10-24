import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import PersetujuanSesi from "@/views/Psikolog/PersetujuanSesi";

export default function PersetujuanSesiPage() {
  return (
    <>
      <PersetujuanSesi />
    </>
  );
}