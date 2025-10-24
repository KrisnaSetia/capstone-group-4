import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styles from "./detail-konsuloff.module.css";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import Spinner from "@/components/Spinner/Mahasiswa";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";

interface DetailPesanan {
  id: number;
  namaPsikolog: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  lokasi: string;
  keluhan: string;
  status: string;
}

interface StatusConfig {
  [key: string]: {
    color: string;
    backgroundColor: string;
    icon: string;
  };
}

const statusConfig: StatusConfig = {
  Terdaftar: {
    color: "green",
    backgroundColor: "#d1fae5",
    icon: "check",
  },
};

export default function DetailPesananOfflineView() {
  const router = useRouter();
  const { id } = router.query;

  const [pesanan, setPesanan] = useState<DetailPesanan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/mahasiswa/konsultasioffline/${id}`);
        if (!res.ok) {
          throw new Error("Data tidak ditemukan");
        }
        const data = await res.json();
        setPesanan(data);
      } catch (err) {
        console.error("Gagal mengambil detail konsultasi:", err);
        setPesanan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status];
    if (!config) return null;

    return <CheckCircle size={16} />;
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <Spinner />;
  }

  if (!pesanan) {
    return <div style={{ padding: "2rem" }}>Pesanan tidak ditemukan.</div>;
  }

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
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Detail Konsultasi Offline</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Kembali
                </Button>
              </div>
            </section>

            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Offline : {pesanan.namaPsikolog}
                </h3>
                <div className={styles.submissionDate}>
                  <span className={styles.dateLabel}>TANGGAL PENGAJUAN</span>
                  <span className={styles.dateValue}>
                    {pesanan.tanggalPengajuan}
                  </span>
                </div>
                <div
                  className={styles.statusBadge}
                  style={{
                    backgroundColor:
                      statusConfig[pesanan.status]?.backgroundColor ||
                      "#e5e7eb",
                    color: statusConfig[pesanan.status]?.color || "#000",
                  }}
                >
                  {getStatusIcon(pesanan.status)}
                  <span>{pesanan.status}</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA PSIKOLOG</span>
                    <span className={styles.detailValue}>
                      {pesanan.namaPsikolog}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      JADWAL KONSULTASI
                    </span>
                    <span className={styles.detailValue}>
                      {pesanan.jadwalKonsultasi}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SESI KONSULTASI</span>
                    <span className={styles.detailValue}>
                      {pesanan.sesiKonsultasi}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>
                      LOKASI KONSULTASI
                    </span>
                    <span className={styles.detailValue}>{pesanan.lokasi}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <p className={styles.keluhanText}>{pesanan.keluhan}</p>
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
