// components/Order/MulaiKonsultasi/index.tsx

import React from "react";
import Link from "next/link";
import styles from "./mulai-konsultasi.module.css";
import { Video } from "lucide-react";

// 1. Interface data sesuai data dummy kamu
export interface KonsultasiData {
  id: string;
  namaMahasiswa: string;
  tanggalPengajuan: string;
  jadwalKonsultasi: string;
  sesiKonsultasi: string;
  keluhan: string;
}

// 2. Props interface
interface MulaiKonsultasiProps {
  data?: KonsultasiData[];
}

// 3. Komponen MulaiKonsultasi
const MulaiKonsultasi: React.FC<MulaiKonsultasiProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <Video size={24} className={styles.icon} />
          </div>
          <span className={styles.message}>Tidak Ada Sesi Konsultasi</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {data.map((sesi) => (
        <Link
          key={sesi.id}
          href={`/psikolog/mulaikonsultasi/detail/${sesi.id}`}
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
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MulaiKonsultasi;