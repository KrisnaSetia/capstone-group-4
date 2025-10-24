import React from "react";
import styles from "./no-riwayat-mhs.module.css";
import { XCircle } from "lucide-react";

const NoRiwayatMahasiswa: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <XCircle size={24} className={styles.icon} />
        </div>
        <span className={styles.message}>Tidak Ada Riwayat</span>
      </div>
    </div>
  );
};

export default NoRiwayatMahasiswa;