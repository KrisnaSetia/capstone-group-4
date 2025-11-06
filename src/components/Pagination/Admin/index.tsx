import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./pagination-admin.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Tampilkan semua halaman jika total halaman <= 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`${styles.pageNumber} ${
              currentPage === i ? styles.active : ""
            }`}
            disabled={isLoading}
          >
            {i}
          </button>
        );
      }
    } else {
      // Logic untuk banyak halaman dengan ellipsis
      if (currentPage <= 3) {
        // Tampilkan: 1 2 3 4 ... last
        for (let i = 1; i <= 4; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`${styles.pageNumber} ${
                currentPage === i ? styles.active : ""
              }`}
              disabled={isLoading}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis-end" className={styles.ellipsis}>
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            className={styles.pageNumber}
            disabled={isLoading}
          >
            {totalPages}
          </button>
        );
      } else if (currentPage >= totalPages - 2) {
        // Tampilkan: 1 ... last-3 last-2 last-1 last
        pages.push(
          <button
            key={1}
            onClick={() => onPageChange(1)}
            className={styles.pageNumber}
            disabled={isLoading}
          >
            1
          </button>
        );
        pages.push(
          <span key="ellipsis-start" className={styles.ellipsis}>
            ...
          </span>
        );
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`${styles.pageNumber} ${
                currentPage === i ? styles.active : ""
              }`}
              disabled={isLoading}
            >
              {i}
            </button>
          );
        }
      } else {
        // Tampilkan: 1 ... current-1 current current+1 ... last
        pages.push(
          <button
            key={1}
            onClick={() => onPageChange(1)}
            className={styles.pageNumber}
            disabled={isLoading}
          >
            1
          </button>
        );
        pages.push(
          <span key="ellipsis-start" className={styles.ellipsis}>
            ...
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`${styles.pageNumber} ${
                currentPage === i ? styles.active : ""
              }`}
              disabled={isLoading}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis-end" className={styles.ellipsis}>
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            onClick={() => onPageChange(totalPages)}
            className={styles.pageNumber}
            disabled={isLoading}
          >
            {totalPages}
          </button>
        );
      }
    }

    return pages;
  };

  return (
    <div className={styles.paginationWrapper}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || isLoading}
        className={styles.arrowButton}
      >
        <ChevronLeft size={20} />
        <span className={styles.arrowText}>Previous</span>
      </button>

      <div className={styles.pageNumbers}>{renderPageNumbers()}</div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || isLoading}
        className={styles.arrowButton}
      >
        <span className={styles.arrowText}>Next</span>
        <ChevronRight size={20} />
      </button>
    </div>
  );
}