import dynamic from "next/dynamic";
import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // role psikolog

const JadwalView = dynamic(() => import("@/views/Psikolog/Jadwal"));

export default function JadwalPage() {
  return <JadwalView />;
}