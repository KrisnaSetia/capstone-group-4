import Head from "next/head";
// import styles from "./dashboard-psi.module.css";
import DashboardLayout from "@/layouts/dashboard-admin";

export default function DashboardAdmin() {
  return (
    <>
      <Head>
        <title>Dashboard Admin | ITS-OK</title>
        <meta
          name="description"
          content="Halaman utama dashboard untuk admin ITS-OK."
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout />
    </>
  );
}
