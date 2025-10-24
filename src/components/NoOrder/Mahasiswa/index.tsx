import React from "react";
import styles from "./no-order-mhs.module.css";
import { XCircle } from "lucide-react";

const NoOrderMahasiswa: React.FC = () => {
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

export default NoOrderMahasiswa;
