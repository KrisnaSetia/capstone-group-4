import React from "react";
import styles from "./no-lagu-mhs.module.css";
import { XCircle } from "lucide-react";

const NoLaguMahasiswa: React.FC = () => {
    return (
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <XCircle size={24} className={styles.icon} />
          </div>
          <span className={styles.message}>Tidak Ada Lagu</span>
        </div>
      );
    };
export default NoLaguMahasiswa;
