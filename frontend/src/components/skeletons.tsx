/**
 * Skeleton loading components for tables and metric cards.
 * Uses CSS animations only — no JS state required.
 */

interface TableSkeletonProps {
  /** Number of header columns */
  columns?: number;
  /** Number of skeleton rows */
  rows?: number;
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  return (
    <div
      className="rounded-xl border bg-background shadow-sm overflow-hidden"
      role="status"
      aria-label="Carregando tabela"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b last:border-0"
              >
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div
                      className="h-4 rounded bg-muted/60 animate-pulse"
                      style={{
                        width: `${60 + ((colIdx * 17 + rowIdx * 13) % 40)}%`,
                        animationDelay: `${(rowIdx * 100 + colIdx * 50)}ms`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t bg-muted/30">
        <div className="h-3 w-40 rounded bg-muted/50 animate-pulse" />
      </div>
    </div>
  );
}

interface MetricCardSkeletonProps {
  /** Number of cards to render */
  count?: number;
}

export function MetricCardsSkeleton({ count = 3 }: MetricCardSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-label="Carregando métricas"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-background p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div
              className="h-3 w-24 rounded bg-muted animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
            <div
              className="h-5 w-5 rounded bg-muted/60 animate-pulse"
              style={{ animationDelay: `${i * 150 + 75}ms` }}
            />
          </div>
          <div>
            <div
              className="h-8 w-16 rounded bg-muted animate-pulse mb-2"
              style={{ animationDelay: `${i * 150 + 50}ms` }}
            />
            <div
              className="h-3 w-32 rounded bg-muted/50 animate-pulse"
              style={{ animationDelay: `${i * 150 + 100}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
