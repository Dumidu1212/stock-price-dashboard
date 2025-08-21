import { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import StockTable from './components/StockTable';
import StockChart from './components/StockChart';
import { fetchGlobalQuote } from './lib/api';
import type { Quote } from './types';

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];

type SortKey = 'symbol' | 'price' | 'changePercent';

export default function App() {
  const [tickers, setTickers] = useState<string[]>(() => {
    const saved = localStorage.getItem('tickers');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_TICKERS;
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    localStorage.setItem('tickers', JSON.stringify(tickers));
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers]);

  function setSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  async function refresh() {
    if (!tickers.length) {
      setQuotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(tickers.map(t => fetchGlobalQuote(t)));
      const ok = results
        .filter(r => r.status === 'fulfilled')
        .map((r: any) => r.value as Quote);
      const errs = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      if (errs.length) {
        setError(`Some symbols failed: ${errs.length}. Try again later (API limit?).`);
      }
      setQuotes(ok);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(ticker: string) {
    if (tickers.includes(ticker)) return;
    setTickers([...tickers, ticker]);
  }

  function handleRemove(ticker: string) {
    setTickers(tickers.filter(t => t !== ticker));
    if (selected === ticker) setSelected(null);
  }

  const title = useMemo(() => 'Stock Price Dashboard', []);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">React + TypeScript + Tailwind • Alpha Vantage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="mb-4">
        <SearchBar onAdd={handleAdd} />
      </section>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <section className="mb-6">
        {loading ? (
          <div className="flex items-center gap-3 text-gray-600">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            <span>Loading quotes...</span>
          </div>
        ) : (
          <StockTable
            rows={quotes}
            onSelect={setSelected}
            sortKey={sortKey}
            sortDir={sortDir}
            setSort={setSort}
            onRemove={handleRemove}
          />
        )}
      </section>

      <section>
        {selected && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Intraday Chart: {selected}</h2>
            <StockChart symbol={selected} />
          </div>
        )}
      </section>

      <footer className="mt-10 text-center text-xs text-gray-500">
        <p>
          Data by Alpha Vantage (free tier). This demo may be limited by rate limits.
        </p>
      </footer>
    </div>
  );
}
