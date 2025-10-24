import React from "react";
import { Modal } from "react-bootstrap";
import styles from "./successjadwal.module.css";
import { CheckCircle2 } from "lucide-react";

interface SuccessJadwalProps {
  show: boolean;
}

export default function SuccessJadwal({ show }: SuccessJadwalProps) {
  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      contentClassName={styles.modalWrapper}
      dialogClassName={styles.dialogCentered}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <CheckCircle2 size={72} color="#22c55e" />
        </div>
        <p className={styles.text}>Jadwal konsultasi berhasil diperbarui!</p>
      </div>
    </Modal>
  );
}
