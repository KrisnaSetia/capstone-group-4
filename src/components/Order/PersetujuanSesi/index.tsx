import React from "react";
import Link from "next/link";
import styles from "./persetujuan-sesi.module.css";
import { Video, Clock, CheckCircle, XCircle } from "lucide-react";

// Interface yang sesuai dengan data dummy
interface SesiData {
  id: string;
  namaMahasiswa: string; // Ubah dari namaPemesan ke namaMahasiswa
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
  status: number;
}

interface PersetujuanSesiPsikologProps {
  data?: SesiData[];
}

const PersetujuanSesiPsikolog: React.FC<PersetujuanSesiPsikologProps> = ({ data = [] }) => {
  const getStatusConfig = (status: SesiData['status']) => {
    switch (status) {
      case 0:
        return {
          text: 'Menunggu Persetujuan',
          color: 'blue',
          icon: Clock
        };
      case 1:
        return {
          text: 'Telah Disetujui',
          color: 'green',
          icon: CheckCircle
        };
      case 2:
        return {
          text: 'Ditolak',
          color: 'red',
          icon: XCircle
        };
      default:
        return {
          text: 'Menunggu Persetujuan',
          color: 'blue',
          icon: Clock
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
            href={`/psikolog/persetujuansesi/detailpesanan/${sesi.id}`}
            className={styles.cardLink}
          >
            <div className={styles.card}>
              <div className={styles.iconContainer}>
                <Video size={24} className={styles.icon} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  Konsultasi Online : {sesi.namaMahasiswa}
                </h3>
                <p className={styles.dateTime}>
                  {sesi.jadwalKonsultasi} | {sesi.sesiKonsultasi}
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

export default PersetujuanSesiPsikolog;