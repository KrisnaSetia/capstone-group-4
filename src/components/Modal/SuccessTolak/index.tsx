import React from "react";
import { Modal } from "react-bootstrap";
import styles from "./successtolak.module.css";
import { CheckCircle2 } from "lucide-react";

interface SuccessOrderProps {
  show: boolean;
}

export default function SuccessOrder({ show }: SuccessOrderProps) {
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
        <p className={styles.text}>Penolakan Sesi Telah Berhasil !</p>
      </div>
    </Modal>
  );
}
