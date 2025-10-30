import Head from "next/head";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard-admin";
import styles from "./admin-konsuloffline.module.css";
import {
  CalendarDays,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PesertaItem = {
  id: number;
  judul: string;
  tanggal: string; // ISO: "2025-12-12"
  sesiLabel: string; // "Sesi 1 (10.00 – 11.30)"
  status: "terdaftar" | "pending" | "batal";
};

// --- Dummy data (gantikan dengan hasil fetch API nanti) ---
const DUMMY: PesertaItem[] = [
  {
    id: 1,
    judul: "Konsultasi Offline : SHCC ITS",
    tanggal: "2025-12-12",
    sesiLabel: "Sesi 1 (10.00 – 11.30)",
    status: "terdaftar",
  },
  {
    id: 2,
    judul: "Konsultasi Offline : SHCC ITS",
    tanggal: "2025-12-12",
    sesiLabel: "Sesi 2 (12.00 – 13.30)",
    status: "terdaftar",
  },
  {
    id: 3,
    judul: "Konsultasi Offline : SHCC ITS",
    tanggal: "2025-12-12",
    sesiLabel: "Sesi 3 (12.00 – 13.30)",
    status: "terdaftar",
  },
];

const formatTanggalLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function KonsultasiOfflineAdminPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>("2025-12-12");
  const [page, setPage] = useState<number>(1);
  const perPage = 3;

  // filter berdasarkan tanggal
  const filtered = useMemo(
    () => DUMMY.filter((i) => i.tanggal === selectedDate),
    [selectedDate]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIdx = (page - 1) * perPage;
  const pageItems = filtered.slice(startIdx, startIdx + perPage);

  const go = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const handleClickItem = (id: number) => {
    // navigasi ke halaman detail
    router.push(`/admin/konsultasioffline/detailkonsultasi/${id}`);
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
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
              />

              {/* Daftar peserta */}
              <h3 className={styles.subHeader} style={{ marginTop: "1rem" }}>
                Peserta Konsultasi
              </h3>

              <div className={styles.listWrapper}>
                {pageItems.length === 0 ? (
                  <p className={styles.infoText}>
                    Tidak ada pesanan untuk tanggal ini.
                  </p>
                ) : (
                  pageItems.map((item) => (
                    <div
                      key={item.id}
                      className={styles.pesertaItem}
                      onClick={() => handleClickItem(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleClickItem(item.id)}
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
                            role="status"
                            aria-label="Terdaftar"
                          >
                            <CheckCircle
                              size={16}
                              className={styles.statusIcon}
                            />
                            <span>Terdaftar</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={`${styles.pagerBtn} ${styles.pagerText}`}
                    onClick={() => go(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        className={`${styles.pageNum} ${
                          n === page ? styles.activePage : ""
                        }`}
                        onClick={() => go(n)}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    className={`${styles.pagerBtn} ${styles.pagerText}`}
                    onClick={() => go(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
