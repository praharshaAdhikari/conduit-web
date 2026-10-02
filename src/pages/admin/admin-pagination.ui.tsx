import { Link, useLocation } from 'react-router';
import type { AdminPagination as AdminPaginationParams } from './admin.state';

type AdminPaginationProps = {
  pagination: AdminPaginationParams;
  count: number;
};

export function AdminPagination({ pagination, count }: AdminPaginationProps) {
  const location = useLocation();
  const { limit, offset: currentOffset } = pagination;
  const pageOffsets = Array.from({ length: Math.ceil(count / limit) }, (_, index) => index * limit);

  function buildPaginationSearchParams(offset: number) {
    const nextSearchParams = new URLSearchParams(location.search);
    nextSearchParams.set('offset', String(offset));
    return `?${nextSearchParams.toString()}`;
  }

  if (pageOffsets.length <= 1) {
    return null;
  }

  return (
    <ul className="pagination">
      {pageOffsets.map((offset, pageIndex) => {
        const isActive = offset === currentOffset;

        return (
          <li key={`page-${offset}`} className={isActive ? 'page-item active' : 'page-item'}>
            <Link
              className="page-link"
              to={{ search: buildPaginationSearchParams(offset) }}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageIndex + 1}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
