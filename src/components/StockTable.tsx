import { useMemo } from 'react';
import type { Quote } from '../types';

type SortKey = 'symbol' | 'price' | 'changePercent';

export default function StockTable({
  rows, onSelect, sortKey, sortDir, setSort,
  onRemove
}: {
  rows: Quote[];
  onSelect: (symbol: string) => void;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  setSort: (key: SortKey) => void;
  onRemove: (symbol: string) => void;
}) {
  const sorted = useMemo(() => {
    const s = [...rows];
    s.sort((a, b) => {
      let vA: number | string = a[sortKey as keyof Quote] as any;
      let vB: number | string = b[sortKey as keyof Quote] as any;
      if (sortKey === 'symbol') {
        const cmp = String(vA).localeCompare(String(vB));
        return sortDir === 'asc' ? cmp : -cmp;
      } else {
        const diff = Number(vA) - Number(vB);
        return sortDir === 'asc' ? diff : -diff;
      }
    });
    return s;
  }, [rows, sortKey, sortDir]);

  function header(label: string, key: SortKey) {
    const active = sortKey === key;
    return (
      <th
        scope="col"
        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 select-none cursor-pointer"
        onClick={() => setSort(key)}
        title="Click to sort"
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {sortDir === 'asc' ? (
                <path d="M7 14l5-5 5 5H7z"></path>
              ) : (
                <path d="M7 10l5 5 5-5H7z"></path>
              )}
            </svg>
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {header('Symbol', 'symbol')}
            {header('Price (USD)', 'price')}
            {header('Change %', 'changePercent')}
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((q) => (
            <tr key={q.symbol} className="hover:bg-indigo-50/30">
              <td className="px-4 py-3 font-mono font-semibold text-gray-900">{q.symbol}</td>
              <td className="px-4 py-3 tabular-nums">${q.price.toFixed(2)}</td>
              <td className={"px-4 py-3 tabular-nums " + (q.changePercent >= 0 ? "text-green-600" : "text-red-600")}>
                {q.changePercent.toFixed(2)}%
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    onClick={() => onSelect(q.symbol)}
                  >
                    View Chart
                  </button>
                  <button
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                    onClick={() => onRemove(q.symbol)}
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
