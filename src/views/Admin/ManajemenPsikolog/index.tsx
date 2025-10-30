import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-admin";

export default function ManajemenPsikologAdminPage() {
  return (
    <>
      <Head>
        <title>Manajemen Psikolog | ITS-OK</title>
        <meta
          name="description"
          content="Halaman manajemen psikolog untuk admin."
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>testing</DashboardLayout>
    </>
  );
}
