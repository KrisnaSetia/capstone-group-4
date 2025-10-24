import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-psi";
import styles from "./mulaikonsultasi-psi.module.css";
import NoOrderPsikolog from "@/components/NoOrder/Psikolog";
import OrderMulaiKonsultasi from "@/components/Order/MulaiKonsultasi";
import PaginationComponent from "@/components/Pagination/Psikolog";
import Spinner from "@/components/Spinner/Psikolog";
import { useEffect, useState } from "react";

interface SesiKonsultasi {
  id: string;
  namaMahasiswa: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: number;
  zoomStartUrl: string | null;
}

export default function MulaiKonsultasiPsikolog() {
  const [data, setData] = useState<SesiKonsultasi[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/psikolog/mulaikonsultasi");
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal mengambil data");

        setData(json.data || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data konsultasi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentPageData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <Head>
        <title>Mulai Konsultasi | ITS-OK</title>
        <meta
          name="description"
          content="Halaman memulai sesi konsultasi psikolog"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>
              Memulai Konsultasi Online Anda
            </h2>
          </div>

          {isLoading ? (
            <Spinner />
          ) : error ? (
            <div style={{ padding: "2rem", color: "red" }}>{error}</div>
          ) : data.length === 0 ? (
            <NoOrderPsikolog />
          ) : (
            <>
              <OrderMulaiKonsultasi data={currentPageData} />
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
