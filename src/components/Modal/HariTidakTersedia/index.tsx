import React from "react";
import { Modal, Button } from "react-bootstrap";
import { XCircle } from "lucide-react";
import styles from "./haritidaktersedia.module.css";

interface HariTidakTersediaModalProps {
  show: boolean;
  onClose: () => void;
  pesan?: string;
}

const HariTidakTersediaModal: React.FC<HariTidakTersediaModalProps> = ({ show, onClose, pesan }) => (
  <Modal show={show} onHide={onClose} centered backdrop="static" className={styles.customModal}>
    <Modal.Body className={styles.body}>
      <div className={styles.alertIcon}>
        <XCircle size={48} color="#ef4444" strokeWidth={2.5} />
      </div>
      <p className={styles.text}>
        {pesan || "Tanggal yang dipilih belum tersedia untuk konsultasi."}
      </p>
      <div className={styles.buttonWrapper}>
        <Button variant="primary" onClick={onClose} className={styles.okButton}>
          OK
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default HariTidakTersediaModal;
