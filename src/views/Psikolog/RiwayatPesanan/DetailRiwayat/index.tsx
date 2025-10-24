import { Button } from "react-bootstrap";
import styles from "./detailriwayat-psi.module.css";
import Head from "next/head";
import Spinner from "@/components/Spinner/Psikolog";
import DashboardLayout from "@/layouts/dashboard-psi";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface DetailRiwayat {
  namaMahasiswa: string;
  tanggalKonsultasi: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
}

export default function DetailRiwayatView() {
  const router = useRouter();
  const { id } = router.query;

  const [riwayat, setRiwayat] = useState<DetailRiwayat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/psikolog/riwayat/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengambil data");

        setRiwayat(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data riwayat.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => router.back();

  if (loading) {
    return <Spinner/>;
  }

  if (error || !riwayat) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        {error || "Data riwayat tidak ditemukan."}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Detail Riwayat | ITS-OK</title>
        <meta
          name="description"
          content="Halaman detail riwayat konsultasi psikolog"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Detail Riwayat Pesanan</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} /> Kembali
                </Button>
              </div>
            </section>

            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Online : {riwayat.namaMahasiswa}
                </h3>
                <div className={styles.submissionDate}>
                  <span className={styles.dateLabel}>TANGGAL KONSULTASI</span>
                  <span className={styles.dateValue}>
                    {riwayat.tanggalKonsultasi}
                  </span>
                </div>
                <div className={`${styles.statusBadge} ${styles.green}`}>
                  <CheckCircle size={16} /> <span>Selesai</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA MAHASISWA</span>
                    <span className={styles.detailValue}>
                      {riwayat.namaMahasiswa}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      JADWAL KONSULTASI
                    </span>
                    <span className={styles.detailValue}>
                      {riwayat.jadwalKonsultasi}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <span className={styles.detailValue}>
                      {riwayat.sesiKonsultasi}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <p className={styles.keluhanText}>{riwayat.keluhan}</p>
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
