import React from "react";
import { Modal, Button } from "react-bootstrap";
import { XCircle } from "lucide-react";
import styles from "./haribatasan.module.css";

interface BatasanHariModalProps {
  show: boolean;
  onClose: () => void;
  pesan?: string;
}

const BatasanHariModal: React.FC<BatasanHariModalProps> = ({ show, onClose, pesan }) => (
  <Modal show={show} onHide={onClose} centered backdrop="static" className={styles.customModal}> {/* Tambahkan className */}
    <Modal.Body className={styles.body}>
      <div className={styles.alertIcon}> {/* Ubah class menjadi alertIcon */}
        <XCircle size={48} color="#ef4444" strokeWidth={2.5} /> {/* Gunakan XCircle */}
      </div>
      <p className={styles.text}> {/* Ubah div menjadi p dan tambahkan className */}
        {pesan || "Mohon pilih hari Selasa atau Kamis saja"}
      </p>
      <div className={styles.buttonWrapper}>
        <Button variant="primary" onClick={onClose} className={styles.okButton}> {/* Tambahkan className */}
          OK
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default BatasanHariModal;