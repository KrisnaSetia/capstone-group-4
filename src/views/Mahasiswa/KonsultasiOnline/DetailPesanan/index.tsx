import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styles from "./detail-konsulonl.module.css";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard";
import { Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner/Mahasiswa";

interface PesananOnline {
  id: string;
  namaPsikolog: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: "Menunggu Persetujuan" | "Telah Disetujui" | "Ditolak";
  zoomLink: string | null;
  alasanPenolakan?: string | null;
}

interface StatusConfig {
  [key: string]: {
    color: string;
    backgroundColor: string;
    icon: string;
  };
}

const statusConfig: StatusConfig = {
  "Menunggu Persetujuan": {
    color: "blue",
    backgroundColor: "#dbeafe",
    icon: "clock",
  },
  "Telah Disetujui": {
    color: "green",
    backgroundColor: "#d1fae5",
    icon: "check",
  },
  Ditolak: {
    color: "red",
    backgroundColor: "#fee2e2",
    icon: "x",
  },
};

export default function DetailPesananView() {
  const router = useRouter();
  const { id } = router.query;

  const [pesanan, setPesanan] = useState<PesananOnline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/mahasiswa/konsultasionline/${id}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        const data = await response.json();
        setPesanan(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status];
    if (!config) return <Clock size={16} />;

    switch (config.icon) {
      case "check":
        return <CheckCircle size={16} />;
      case "x":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  }

  if (!pesanan) {
    return <div style={{ padding: "2rem" }}>Pesanan tidak ditemukan.</div>;
  }

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
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>Detail Konsultasi Online</h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Kembali
                </Button>
              </div>
            </section>

            {/* Kartu Utama Detail */}
            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Online : {pesanan.namaPsikolog}
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
                      "#fef3c7",
                    color: statusConfig[pesanan.status]?.color || "#d97706",
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
                    <span className={styles.detailLabel}>KELUHAN PASIEN</span>
                    <p className={styles.keluhanText}>{pesanan.keluhan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kartu Link Zoom */}
            <div
              className={styles.detailContainer}
              style={{ marginTop: "2rem" }}
            >
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Link Zoom Konsultasi Online
                </h3>
              </div>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>LINK ZOOM</span>
                    <span className={styles.detailValue}>
                      {pesanan.status === "Telah Disetujui" &&
                      pesanan.zoomLink ? (
                        <a
                          href={pesanan.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#2563eb",
                            textDecoration: "underline",
                          }}
                        >
                          {pesanan.zoomLink}
                        </a>
                      ) : pesanan.status === "Menunggu Persetujuan" ? (
                        "Menunggu persetujuan psikolog"
                      ) : (
                        "Konsultasi ditolak"
                      )}
                    </span>
                  </div>
                </div>
                {pesanan.status === "Ditolak" && pesanan.alasanPenolakan && (
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        ALASAN PENOLAKAN
                      </span>
                      <span className={styles.detailValue}>
                        {pesanan.alasanPenolakan}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
