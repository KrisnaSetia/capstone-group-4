import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import styles from "./filtermodal.module.css";

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onFilter: (selectedDate: string | null, selectedSessions: number[] | null) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ show, onClose, onFilter }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const handleSessionChange = (session: number) => {
    setSelectedSessions((prev) =>
      prev.includes(session)
        ? prev.filter((s) => s !== session)
        : [...prev, session]
    );
  };

  const handleConfirm = () => {
    if (!selectedDate && selectedSessions.length === 0) {
        onFilter(null, null);
        onClose();
        return;
    }

    if (selectedDate && selectedSessions.length > 0) {
        onFilter(selectedDate, selectedSessions);
        onClose();
    } else {
        alert("Silakan pilih tanggal dan minimal satu sesi.");
    }
    };

  return (
    <Modal show={show} onHide={onClose} centered>
      <div className={styles.modalHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h5 className={styles.modalTitle}>Filter Jadwal</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        </div>
      <Modal.Body className={styles.modalBody}>
        <div className={styles.filterSection}>
          <label className={styles.label}>Tanggal</label>
          <Form.Control
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        <div
            className={`${styles.sessionBox} ${
                selectedSessions.includes(1) ? styles.sessionBoxChecked : ""
            }`}
            onClick={() => handleSessionChange(1)}
            >
            <Form.Check
                type="checkbox"
                id="sesi-1"
                label="Sesi 1 | 10:00 – 11:30"
                checked={selectedSessions.includes(1)}
                onChange={() => {}}
                className={styles.checkboxInput}
            />
            </div>

            <div
                className={`${styles.sessionBox} ${
                    selectedSessions.includes(2) ? styles.sessionBoxChecked : ""
                }`}
                onClick={() => handleSessionChange(2)}
                >
                <Form.Check
                    type="checkbox"
                    id="sesi-2"
                    label="Sesi 2 | 12:00 – 13:30"
                    checked={selectedSessions.includes(2)}
                    onChange={() => {}}
                    className={styles.checkboxInput}
                />
                </div>

                <div
                className={`${styles.sessionBox} ${
                    selectedSessions.includes(3) ? styles.sessionBoxChecked : ""
                }`}
                onClick={() => handleSessionChange(3)}
                >
                <Form.Check
                    type="checkbox"
                    id="sesi-3"
                    label="Sesi 3 | 14:00 – 15:30"
                    checked={selectedSessions.includes(3)}
                    onChange={() => {}}
                    className={styles.checkboxInput}
                />
                </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between w-100">
        <Button
            variant="danger"
            onClick={() => {
            setSelectedDate("");
            setSelectedSessions([]);
            onFilter(null, null);
            onClose();
            }}
        >
            Reset Filter
        </Button>
        <div>
            <Button variant="secondary" onClick={onClose} className="me-2">
            Batal
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
            Konfirmasi Filter
            </Button>
        </div>
        </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
