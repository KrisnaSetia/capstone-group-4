import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import styles from "./detail-sesi.module.css";
import Head from "next/head";
import DashboardLayout from "@/layouts/dashboard-psi";
import Spinner from "@/components/Spinner/Psikolog";
import { Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import SuccessOrder from "@/components/Modal/SuccessOrder";

interface PesananSesi {
  id: string;
  namaMahasiswa: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: number;
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
    color: "#3b82f6",
    backgroundColor: "#dbeafe",
    icon: "clock",
  },
  "Telah Disetujui": {
    color: "#10b981",
    backgroundColor: "#d1fae5",
    icon: "check",
  },
  Ditolak: {
    color: "#ef4444",
    backgroundColor: "#fee2e2",
    icon: "x",
  },
};

const mapStatusToText: Record<number, string> = {
  0: "Ditolak",
  1: "Menunggu Persetujuan",
  2: "Telah Disetujui",
};

export default function DetailPesananView() {
  const router = useRouter();
  const { id } = router.query;
  const [showSuccess, setShowSuccess] = useState(false);
  const [pesanan, setPesanan] = useState<PesananSesi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/psikolog/persetujuansesi/${id}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message || "Gagal mengambil data");
        }
        const data = await res.json();
        setPesanan(data);
      } catch (err: unknown) {
        console.error(err);
        setError("Gagal mengambil data dari server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusIcon = (statusText: string) => {
    const config = statusConfig[statusText];
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
    router.push("/psikolog/persetujuansesi");
  };

  const handleApprove = async () => {
    if (!pesanan) return;

    try {
      const response = await fetch("/api/psikolog/setuju-persetujuansesi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_konsultasi: pesanan.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyetujui konsultasi");
      }

      // Tampilkan modal sukses
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/psikolog/persetujuansesi");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      alert("Terjadi kesalahan saat menyetujui konsultasi.");
    }
  };

  const handleReject = () => {
    if (!pesanan) return;
    router.push(`/psikolog/persetujuansesi/alasanpenolakan/${pesanan.id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error || !pesanan) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        {error || "Pesanan tidak ditemukan."}
      </div>
    );
  }

  const statusText = mapStatusToText[pesanan.status] || "Menunggu Persetujuan";

  return (
    <>
      <Head>
        <title>Detail Persetujuan Sesi | ITS-OK</title>
        <meta
          name="description"
          content="Halaman detail persetujuan sesi psikolog"
        />
        <link rel="icon" href="/logo/favicon.png" />
      </Head>
      <DashboardLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.contentWrapper}>
            <section className={styles.headerSection}>
              <div className={styles.headerContent}>
                <h2 className={styles.pageTitle}>
                  Detail Persetujuan Sesi Konsultasi Online
                </h2>
                <Button onClick={handleBack} className={styles.backButton}>
                  <ArrowLeft size={20} />
                  Kembali
                </Button>
              </div>
            </section>

            <div className={styles.detailContainer}>
              <div className={styles.consultationHeader}>
                <h3 className={styles.consultationTitle}>
                  Konsultasi Online : {pesanan.namaMahasiswa}
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
                      statusConfig[statusText]?.backgroundColor || "#fef3c7",
                    color: statusConfig[statusText]?.color || "#d97706",
                  }}
                >
                  {getStatusIcon(statusText)}
                  <span>{statusText}</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>NAMA MAHASISWA</span>
                    <span className={styles.detailValue}>
                      {pesanan.namaMahasiswa}
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

              <div className={styles.actionButtons}>
                <Button
                  variant="primary"
                  className={styles.approveButton}
                  onClick={handleApprove}
                >
                  Setujui
                </Button>
                <Button
                  variant="outline-danger"
                  className={styles.rejectButton}
                  onClick={handleReject}
                >
                  Tolak
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      <SuccessOrder show={showSuccess} />
    </>
  );
}
