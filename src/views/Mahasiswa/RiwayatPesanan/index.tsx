/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import styles from "./riwayatpesanan-mhs.module.css";
import NoOrderMahasiswa from "@/components/NoRiwayat/Mahasiswa";
import PaginationComponent from "@/components/Pagination/Mahasiswa";
import RiwayatPesananMahasiswa from "@/components/Order/RiwayatPesanan/Mahasiswa";
import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner/Mahasiswa";

// Format tanggal: ISO → 'DD NamaBulan YYYY'
const formatTanggalID = (dateString: string): string => {
  if (!dateString) return "Tanggal tidak valid";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Tanggal tidak valid";
  }
};

// Mapping sesi: 1 → "Sesi 1 (10.00 - 10.40)", dst.
const formatSesiById = (sesi: number): string => {
  const map: Record<number, string> = {
    1: "Sesi 1 (10.00 - 10.40)",
    2: "Sesi 2 (11.00 - 11.40)",
    3: "Sesi 3 (12.00 - 12.40)",
  };
  return map[sesi] || `Sesi ${sesi}`;
};

// Tipe data dari API backend
interface ApiRiwayatData {
  id_riwayat: string | number;
  waktu_mulai: string;
  waktu_selesai: string;
  status_akhir: string;
  id_konsultasi_online: string | number;
  id_psikolog: string | number;
  namaPsikolog: string;
  keluhan: string;
  tanggal_pengajuan: string;
  sesi: number; // wajib disediakan oleh API
}

// Tipe frontend untuk komponen RiwayatPesananMahasiswa
interface RiwayatItem {
  id: string;
  namaPemesan: string;
  tanggal: string;
  sesi: string;
}

export default function RiwayatPesananMahasiswaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchRiwayatData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/mahasiswa/riwayat");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data riwayat");
        }

        const mappedData = (result.data || []).map(
          (item: ApiRiwayatData): RiwayatItem => ({
            id: item.id_riwayat.toString(),
            namaPemesan: item.namaPsikolog,
            tanggal: formatTanggalID(item.waktu_mulai),
            sesi: formatSesiById(item.sesi),
          })
        );

        setDaftarRiwayat(mappedData);
      } catch (error: any) {
        console.error("Error fetching riwayat data:", error);
        setDaftarRiwayat([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayatData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredRiwayat = daftarRiwayat.filter((item) =>
    item.namaPemesan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentTableData = filteredRiwayat.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Head>
        <title>Riwayat Konsultasi | ITS-OK</title>
        <meta
          name="description"
          content="Halaman riwayat konsultasi mahasiswa"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.headerLine}>
            <h2 className={styles.sectionTitle}>
              Riwayat Konsultasi Online Anda
            </h2>
          </div>

          <div className={styles.searchBarContainer}>
            <Form.Control
              type="text"
              placeholder="Cari riwayat berdasarkan nama psikolog..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", margin: "2rem 0" }}>
              <Spinner />
            </div>
          ) : currentTableData.length === 0 ? (
            <NoOrderMahasiswa />
          ) : (
            <RiwayatPesananMahasiswa data={currentTableData} />
          )}

          {totalPages > 1 && !isLoading && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
