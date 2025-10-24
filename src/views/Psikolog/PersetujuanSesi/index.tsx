/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-psi";
import styles from "./persetujuansesi-psi.module.css";
import Spinner from "@/components/Spinner/Psikolog";
import NoOrderPsikolog from "@/components/NoOrder/Psikolog";
import OrderPsikolog from "@/components/Order/PersetujuanSesi";
import PaginationComponent from "@/components/Pagination/Psikolog";
import { useEffect, useState } from "react";

interface SesiData {
  id: string;
  namaMahasiswa: string;
  tanggal_pengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: number;
}

const mapStatus: Record<number, "menunggu" | "disetujui" | "ditolak"> = {
  0: "ditolak",
  1: "menunggu",
  2: "disetujui",
};

export default function PersetujuanSesiPsikolog() {
  const [sesiData, setSesiData] = useState<SesiData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSesi = async () => {
      try {
        const res = await fetch("/api/psikolog/persetujuansesi");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Gagal mengambil data");
        }

        const data = (json.data || []).map((item: any) => ({
          id: item.id.toString(),
          namaMahasiswa: item.namaMahasiswa,
          tanggal_pengajuan: item.tanggal_pengajuan,
          jadwalKonsultasi: item.jadwalKonsultasi,
          sesiKonsultasi: item.sesiKonsultasi,
          keluhan: item.keluhan,
          status: mapStatus[item.status] || "menunggu",
        }));

        setSesiData(data);
      } catch (err) {
        console.error("Error saat ambil data sesi:", err);
        setSesiData([]); // fallback agar tetap render <NoOrderPsikolog />
      } finally {
        setIsLoading(false);
      }
    };

    fetchSesi();
  }, []);

  const totalPages = Math.ceil(sesiData.length / itemsPerPage);
  const currentPageData = sesiData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Head>
        <title>Persetujuan Sesi | ITS-OK</title>
        <meta name="description" content="Halaman persetujuan sesi psikolog" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>
              Persetujuan Sesi Konsultasi Online Anda
            </h2>
          </div>
          {isLoading ? (
            <Spinner />
          ) : sesiData.length === 0 ? (
            <NoOrderPsikolog />
          ) : (
            <>
              <OrderPsikolog data={currentPageData} />
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={false}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
