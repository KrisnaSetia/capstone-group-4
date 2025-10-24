import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import DetailMulaiKonsultasiView from "@/views/Psikolog/MulaiKonsultasi/DetailMulai";

export default function DetailMulaiKonsultasiPage() {

  return <DetailMulaiKonsultasiView/>;
}
