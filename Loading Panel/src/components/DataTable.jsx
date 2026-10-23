import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export function DataTable({
  columns,
  rows,
  rowKey,
  caption,
  sort,
  onSort,
  page,
  pages,
  total,
  pageSize,
  onPage,
  loading = false,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyAction,
  mobileRender,
}) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = total ? Math.min(total, page * pageSize) : 0;

  return (
    <div className="card overflow-hidden">
      {loading ? (
        <div className="p-5"><LoadingSkeleton rows={5} /></div>
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <>
          <div className={mobileRender ? 'hidden md:block' : 'block'}>
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse text-sm">
                <caption className="sr-only">{caption}</caption>
                <thead className="bg-soft text-left text-xs uppercase tracking-[0.12em] text-muted">
                  <tr>
                    {columns.map((column) => {
                      const active = sort?.key === column.key;
                      const ariaSort = !column.sortable ? undefined : active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none';
                      return (
                        <th key={column.key} scope="col" aria-sort={ariaSort} className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {column.sortable ? (
                            <button type="button" className="inline-flex items-center gap-1 uppercase tracking-[0.12em]" onClick={() => onSort?.(column.key)}>
                              {column.label}
                              {active ? (sort.dir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : null}
                            </button>
                          ) : column.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row[rowKey]} className="border-t border-line">
                      {columns.map((column) => (
                        <td key={column.key} className={`px-4 py-3 align-middle ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.className || ''}`}>
                          {column.render ? column.render(row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {mobileRender ? (
            <div className="space-y-3 p-3 md:hidden">
              {rows.map((row) => (
                <div key={row[rowKey]} className="rounded-control border border-line p-3">
                  {mobileRender(row)}
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
      {onPage && total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
          <p>Showing {start}–{end} of {total}</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-outline px-2.5 py-2" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>Page {page} of {pages}</span>
            <button type="button" className="btn btn-outline px-2.5 py-2" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
