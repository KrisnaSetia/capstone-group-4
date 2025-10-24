// src/components/Spinner/index.tsx
import React from "react";
import styles from "./spinner.module.css";

const Spinner: React.FC = () => {
  return (
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Spinner;
