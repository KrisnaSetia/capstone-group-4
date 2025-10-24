import React from "react";
import Link from "next/link";
import styles from "./konsultasi-offline.module.css";
import { Video, CheckCircle } from "lucide-react";

interface SesiData {
  id: string;
  namaPemesan: string;
  tanggal: string;
  sesi: string;
  status: "terdaftar";
}

interface OrderMahasiswaProps {
  data?: SesiData[];
  detailLinkPrefix?: string; // default: /mahasiswa/konsultasi/detailpesanan/
}

const OrderMahasiswa: React.FC<OrderMahasiswaProps> = ({
  data = [],
  detailLinkPrefix = "/mahasiswa/konsultasioffline/detailpesanan/", // default path
}) => {
  const getStatusConfig = (status: SesiData["status"]) => {
    switch (status) {
      case "terdaftar":
        return {
          text: "Terdaftar",
          color: "green",
          icon: CheckCircle,
        };
      default:
        return {
          text: "Terdaftar",
          color: "green",
          icon: CheckCircle,
        };
    }
  };

  if (data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <Video size={24} className={styles.icon} />
          </div>
          <span className={styles.message}>Tidak Ada Pesanan</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {data.map((sesi) => {
        const statusConfig = getStatusConfig(sesi.status);
        const StatusIcon = statusConfig.icon;

        return (
          <Link
            key={sesi.id}
            href={`${detailLinkPrefix}${sesi.id}`}
            className={styles.cardLink}
          >
            <div className={styles.card}>
              <div className={styles.iconContainer}>
                <Video size={24} className={styles.icon} />
              </div>

              <div className={styles.content}>
                <h3 className={styles.title}>
                  Konsultasi Offline : {sesi.namaPemesan}
                </h3>
                <p className={styles.dateTime}>
                  {sesi.tanggal} | {sesi.sesi}
                </p>
                <div className={`${styles.status} ${styles[statusConfig.color]}`}>
                  <StatusIcon size={16} className={styles.statusIcon} />
                  {statusConfig.text}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default OrderMahasiswa;
