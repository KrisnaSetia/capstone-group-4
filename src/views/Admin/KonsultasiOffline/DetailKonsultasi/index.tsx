// src/views/Admin/KonsultasiOffline/DetailKonsultasi/index.tsx
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowLeft, CheckCircle } from "lucide-react";

import DashboardLayout from "@/layouts/dashboard-admin";
import Spinner from "@/components/Spinner/Mahasiswa";
import styles from "./detail-konsuloff-admin.module.css";

type DetailPesanan = {
  id: number;
  namaPsikolog: string;
  tanggalPengajuan: string;  // contoh: "09 Juni 2025 pukul 14.30"
  jadwalKonsultasi: string;  // contoh: "Selasa, 17 Juni 2025"
  sesiKonsultasi: string;    // contoh: "Sesi 2 (12.00 – 13.30)"
  lokasi: string;            // contoh: "Lantai 2 Kantin Pusat ITS"
  keluhan: string;
  status: "Terdaftar" | "Menunggu" | "Ditolak";
};

const STATUS_STYLE: Record<
  DetailPesanan["status"],
  { color: string; bg: string }
> = {
  Terdaftar: { color: "#16A34A", bg: "#D1FAE5" }, // hijau
  Menunggu: { color: "#92400E", bg: "#FEF3C7" },  // amber
  Ditolak:  { color: "#B91C1C", bg: "#FEE2E2" },  // merah
};

export default function DetailKonsulOfflineAdminView() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<DetailPesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const safeId = Array.isArray(id) ? id[0] : id;

    (async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(`/api/admin/detailkonsultasioffline/${encodeURIComponent(safeId)}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal memuat data");
        }
        
        const json = (await res.json()) as DetailPesanan;
        setData(json);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBack = () => router.push("/admin/konsultasioffline");

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "1rem" }}>
            {error || "Data tidak ditemukan"}
          </p>
          <Button onClick={handleBack}>Kembali</Button>
        </div>
      </DashboardLayout>
    );
  }

  const badgeStyle = STATUS_STYLE[data.status] ?? { color: "#111827", bg: "#E5E7EB" };

  return (
    <>
      <Head>
        <title>Detail Konsultasi Offline | ITS-OK</title>
        <meta name="description" content="Detail pesanan konsultasi offline - Admin" />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>

      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            {/* Header */}
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Detail Konsultasi Offline</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Kembali
                </Button>
              </div>
            </section>

            {/* Card detail */}
            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Offline : {data.namaPsikolog}
                </h3>

                <div className={styles.submissionDate}>
                  <span className={styles.dateLabel}>TANGGAL PENGAJUAN</span>
                  <span className={styles.dateValue}>{data.tanggalPengajuan}</span>
                </div>

                <div
                  className={styles.statusBadge}
                  style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
                >
                  <CheckCircle size={16} />
                  <span>{data.status}</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA PSIKOLOG</span>
                    <span className={styles.detailValue}>{data.namaPsikolog}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>JADWAL KONSULTASI</span>
                    <span className={styles.detailValue}>{data.jadwalKonsultasi}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <span className={styles.detailValue}>{data.sesiKonsultasi}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>LOKASI KONSULTASI</span>
                    <span className={styles.detailValue}>{data.lokasi}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <p className={styles.keluhanText}>{data.keluhan}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}