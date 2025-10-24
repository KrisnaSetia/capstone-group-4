import { Pagination } from "react-bootstrap";
import styles from "./pagination-mhs.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1 || isLoading) return null;

  return (
    <div className={styles.paginationContainer}>
      <Pagination className={styles.customPagination}>
        <Pagination.Prev
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          &lt; Previous
        </Pagination.Prev>
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index}
            active={index + 1 === currentPage}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next &gt;
        </Pagination.Next>
      </Pagination>
    </div>
  );
}
