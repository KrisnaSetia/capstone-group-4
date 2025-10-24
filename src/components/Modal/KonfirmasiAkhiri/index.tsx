// src/components/Modal/KonfirmasiAkhiri/index.tsx

import React from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./konfirmasiakhiri.module.css";
import { AlertTriangle } from "lucide-react";

interface KonfirmasiAkhiriProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function KonfirmasiAkhiri({
  show,
  onHide,
  onConfirm,
  isSubmitting = false,
}: KonfirmasiAkhiriProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      contentClassName={styles.modalWrapper}
      dialogClassName={styles.dialogCentered}
      keyboard={!isSubmitting}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          {/* Menggunakan ikon peringatan untuk konfirmasi */}
          <AlertTriangle size={60} color="#f59e0b" />
        </div>
        <h3 className={styles.title}>Akhiri Sesi Konsultasi?</h3>
        <p className={styles.subtitle}>
          Apakah Anda yakin ingin mengakhiri sesi ini? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className={styles.buttonContainer}>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={isSubmitting}
          >
            Tidak
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memproses..." : "Iya, Akhiri Sesi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}