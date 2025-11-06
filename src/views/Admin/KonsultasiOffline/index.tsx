import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard-admin";
import styles from "./admin-konsuloffline.module.css";
import PaginationComponent from "@/components/Pagination/Admin";
import {
  CalendarDays,
  CheckCircle,
  Users,
  XCircle,
  Loader2,
} from "lucide-react";

type PesertaItem = {
  id: number;
  judul: string;
  tanggal: string; // ISO: "2025-12-12"
  sesiLabel: string; // "Sesi 1 (10.00 – 11.30)"
  status: "terdaftar" | "pending" | "batal";
};

type ApiResponse = {
  meta: {
    date: string;
    count: number;
    limit: number;
    offset: number;
  };
  data: PesertaItem[];
};

const formatTanggalLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function KonsultasiOfflineAdminPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PesertaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // const [totalPages, setTotalPages] = useState<number>(1);
  const perPage = 4;
  const totalPages = Math.ceil(data.length / perPage);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const offset = (page - 1) * perPage;
        const response = await fetch(
          `/api/admin/konsultasioffline?date=${selectedDate}&limit=${perPage}&offset=${offset}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memuat data");
        }

        const result: ApiResponse = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, page, perPage]);


  const handleClickItem = (id: number) => {
    router.push(`/admin/konsultasioffline/detailkonsultasi/${id}`);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setPage(1); // Reset ke halaman pertama
  };

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

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            {/* Judul halaman */}
            <div className={styles.sectionTitleWrapper}>
              <h2 className={styles.pageTitle}>Pesanan Konsultasi Offline</h2>
            </div>

            {/* Kartu utama */}
            <div className={styles.formContainer}>
              {/* Pilih tanggal */}
              <label htmlFor="tanggal" className={styles.jadwalLabel}>
                <CalendarDays size={18} className={styles.icon} />
                Jadwal Konsultasi
              </label>
              <input
                id="tanggal"
                type="date"
                className={styles.inputDate}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />

              {/* Daftar peserta */}
              <h3 className={styles.subHeader} style={{ marginTop: "1rem" }}>
                Peserta Konsultasi
              </h3>

              <div className={styles.listWrapper}>
                {/* Loading state */}
                {loading && (
                  <div
                    className={styles.infoText}
                    style={{ textAlign: "center" }}
                  >
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ display: "inline-block", marginRight: "8px" }}
                    />
                    Memuat data...
                  </div>
                )}

                {/* Error state */}
                {error && !loading && (
                  <div className={styles.infoText} style={{ color: "#dc2626" }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Empty state */}
                {!loading && !error && data.length === 0 && (
                  <p className={styles.infoText}>
                    Tidak ada pesanan untuk tanggal ini.
                  </p>
                )}

                {/* Data list */}
                {!loading &&
                  !error &&
                  data.length > 0 &&
                  data.map((item) => (
                    <div
                      key={item.id}
                      className={styles.pesertaItem}
                      onClick={() => handleClickItem(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleClickItem(item.id)
                      }
                      aria-label={`Buka detail ${item.judul} ${item.sesiLabel}`}
                    >
                      <div className={styles.pesertaLeft}>
                        <div className={styles.iconBox}>
                          <Users size={22} />
                        </div>
                        <div className={styles.pesertaText}>
                          <div className={styles.itemTitle}>{item.judul}</div>
                          <div className={styles.itemSub}>
                            {formatTanggalLong(item.tanggal)} &nbsp;|&nbsp;{" "}
                            {item.sesiLabel}
                          </div>
                          <div
                            className={styles.statusBadge}
                            data-status={item.status}
                            role="status"
                            aria-label={
                              item.status === "terdaftar"
                                ? "Terdaftar"
                                : "Dibatalkan"
                            }
                          >
                            {item.status === "terdaftar" ? (
                              <>
                                <CheckCircle
                                  size={16}
                                  className={styles.statusIcon}
                                />
                                <span>Terdaftar</span>
                              </>
                            ) : (
                              <>
                                <XCircle
                                  size={16}
                                  className={styles.statusIcon}
                                />
                                <span>Dibatalkan</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {!loading && data.length > 0 && (
                <PaginationComponent
                  currentPage={page}
                  totalPages={totalPages}
                  isLoading={loading}
                  onPageChange={(p: number) => setPage(p)}
                />
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
