import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./ratingpsikolog.module.css";

interface RatingPsikologProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

export default function RatingPsikolog({
  show,
  onClose,
  onSubmit,
}: RatingPsikologProps) {
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      contentClassName={styles.modalWrapper}
      dialogClassName={styles.dialogCentered}
      onHide={onClose}
    >
      <div className={styles.content}>
        <h4 className={styles.title}>Beri Rating Psikolog</h4>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((bintang) => (
            <span
              key={bintang}
              className={`${styles.star} ${
                bintang <= selectedRating ? styles.filled : ""
              }`}
              onClick={() => setSelectedRating(bintang)}
            >
              ★
            </span>
          ))}
        </div>
        <div className={styles.buttonGroup}>
            <Button className={styles.batalButton} onClick={onClose}>
            Batal
            </Button>
            <Button
            className={styles.kirimButton}
            disabled={selectedRating === 0}
            onClick={() => {
                onSubmit(selectedRating);
                setSelectedRating(0);
            }}
            >
            Kirim
            </Button>
        </div>
      </div>
    </Modal>
  );
}