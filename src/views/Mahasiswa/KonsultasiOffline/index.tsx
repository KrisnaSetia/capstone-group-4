/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./konsuloff-mhs.module.css";
import { Button } from "react-bootstrap";
import { Plus } from "lucide-react";
import NoOrderMahasiswa from "@/components/NoOrder/Mahasiswa";
import OrderMahasiswa from "@/components/Order/KonsultasiOffline";
import Spinner from "@/components/Spinner/Mahasiswa";
import PaginationComponent from "@/components/Pagination/Mahasiswa";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface SesiData {
  id: string;
  namaPemesan: string;
  tanggal: string;
  sesi: string;
  status: "terdaftar";
}

export default function KonsultasiOfflineMahasiswa() {
  const [orderData, setOrderData] = useState<SesiData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const itemsPerPage = 4;
  const totalPages = Math.ceil(orderData.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mahasiswa/konsultasioffline");
        if (!res.ok) {
          throw new Error("Gagal mengambil data konsultasi.");
        }

        const result = await res.json();
        const apiData = result.data;

        const formattedData: SesiData[] = apiData.map((item: any) => ({
          id: item.id_konsultasi.toString(),
          namaPemesan: "SHCC ITS",
          tanggal: new Date(item.tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          sesi: `Sesi ${item.sesi} (${item.jam})`,
          status: "terdaftar",
        }));

        setOrderData(formattedData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentPageData = orderData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Head>
        <title>Konsultasi Offline | ITS-OK</title>
        <meta
          name="description"
          content="Halaman konsultasi offline mahasiswa"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>
              Pesanan Konsultasi Offline Anda
            </h2>
            <Button
              className={styles.registerButton}
              onClick={() =>
                router.push("/mahasiswa/konsultasioffline/daftarkonsultasi")
              }
            >
              <Plus size={16} className={styles.plusIcon} />
              Daftar Konsultasi Offline
            </Button>
          </div>

          {isLoading ? (
            <Spinner />
          ) : orderData.length === 0 ? (
            <NoOrderMahasiswa />
          ) : (
            <>
              <OrderMahasiswa data={currentPageData} />
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
