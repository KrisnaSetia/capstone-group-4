import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./konsulonline-mhs.module.css";
import { Button } from "react-bootstrap";
import { Plus } from "lucide-react";
import NoOrderMahasiswa from "@/components/NoOrder/Mahasiswa";
import OrderMahasiswa from "@/components/Order/KonsultasiOnline";
import PaginationComponent from "@/components/Pagination/Mahasiswa";
import Spinner from "@/components/Spinner/Mahasiswa";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface SesiData {
  id: string;
  namaPsikolog: string;
  tanggal: string;
  sesi: string;
  status: "menunggu" | "disetujui" | "ditolak";
}

export default function KonsultasiOnlineMahasiswa() {
  const [orderData, setOrderData] = useState<SesiData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(orderData.length / itemsPerPage);

  const router = useRouter();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentPageData = orderData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/mahasiswa/konsultasionline");
        const json = await res.json();
        setOrderData(
          (json.data || []).map((item: SesiData) => ({
            ...item,
            tanggal: new Date(item.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          }))
        );
      } catch (error) {
        console.error("Gagal mengambil data konsultasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Konsultasi Online | ITS-OK</title>
        <meta
          name="description"
          content="Halaman konsultasi online mahasiswa"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>
              Pesanan Konsultasi Online Anda
            </h2>
            <Button
              className={styles.registerButton}
              onClick={() =>
                router.push("/mahasiswa/konsultasionline/pilihpsikolog")
              }
            >
              <Plus size={16} className={styles.plusIcon} />
              Daftar Sekarang
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
