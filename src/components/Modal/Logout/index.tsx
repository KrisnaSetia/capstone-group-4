import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import styles from "./logoutmodal.module.css";
import { LogOut } from "lucide-react";

interface LogoutConfirmationProps {
  show: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmation({
  show,
  loading,
  onCancel,
  onConfirm,
}: LogoutConfirmationProps) {
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
          <LogOut size={64} color="#ef4444" />
        </div>
        <p className={styles.text}>Apakah kamu yakin ingin keluar?</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                {" Keluar..."}
              </>
            ) : (
              "Keluar"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
