// src/components/Modal/SuccessAkhiri/index.tsx

import React from "react";
import { Modal } from "react-bootstrap";
import styles from "./successakhiri.module.css";
import { CheckCircle2 } from "lucide-react";

interface SuccessAkhiriProps {
  show: boolean;
}

export default function SuccessAkhiri({ show }: SuccessAkhiriProps) {
  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      contentClassName={styles.modalWrapper}
      dialogClassName={styles.dialogCentered}
      keyboard={false}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          <CheckCircle2 size={72} color="#22c55e" />
        </div>
        <p className={styles.text}>Sesi berhasil diakhiri!</p>
      </div>
    </Modal>
  );
}