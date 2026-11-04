import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

type PageItem = number | 'gap';

/**
 * Menghasilkan daftar nomor halaman yang ringkas, contohnya:
 * 1 … 4 5 6 … 20
 */
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const visible = [1, page - 1, page, page + 1, totalPages]
    .filter((p) => p >= 1 && p <= totalPages)
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) items.push('gap');
    items.push(p);
  });
  return items;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const baseButton =
    'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-gray-500">
        Menampilkan <span className="font-medium text-gray-900">{from}–{to}</span> dari{' '}
        <span className="font-medium text-gray-900">{total}</span> data
      </p>

      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Halaman sebelumnya"
          className={`${baseButton} text-gray-600 hover:bg-gray-100`}
        >
          <ChevronLeft size={18} />
        </button>

        {getPageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={disabled}
              aria-current={item === page ? 'page' : undefined}
              className={`${baseButton} ${
                item === page ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Halaman berikutnya"
          className={`${baseButton} text-gray-600 hover:bg-gray-100`}
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
}