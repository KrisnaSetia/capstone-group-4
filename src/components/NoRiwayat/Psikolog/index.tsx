import React from "react";
import styles from "./no-riwayat-psi.module.css";
import { XCircle } from "lucide-react";

const NoOrderPsikolog: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <XCircle size={24} className={styles.icon} />
        </div>
        <span className={styles.message}>Tidak Ada Pesanan</span>
      </div>
    </div>
  );
};

export default NoOrderPsikolog;
