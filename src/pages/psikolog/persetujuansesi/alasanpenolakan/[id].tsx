import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import AlasanPenolakanPage from "@/views/Psikolog/PersetujuanSesi/AlasanPenolakan";
export default function AlasanPenolakan() {
  return (
    <>
      <AlasanPenolakanPage/>
    </>
  );
}
