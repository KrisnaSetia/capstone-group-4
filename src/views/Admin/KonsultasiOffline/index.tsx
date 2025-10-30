import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-admin";

export default function KonsultasiOfflineAdminPage() {
  return (
    <>
      <Head>
        <title>Konsultasi Offline | ITS-OK</title>
        <meta
          name="description"
          content="Halaman manajemen konsultasi offline untuk admin."
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>testing</DashboardLayout>
    </>
  );
}
