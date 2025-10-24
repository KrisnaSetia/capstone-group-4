import { withAuthSSR } from "@/lib/auth";
export const getServerSideProps = withAuthSSR(undefined, [0]); // Role psikolog = 0
import EditProfile from '@/views/Psikolog/editProfile';

export default function EditProfilePage() {
  return (
    <>
      <EditProfile />
    </>
  );
}