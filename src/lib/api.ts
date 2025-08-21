const API_BASE = 'https://www.alphavantage.co/query';
const KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY?.trim();

function getKeyOrDemo(symbol?: string) {
  // Alpha Vantage supports a 'demo' key for certain endpoints & symbols (e.g., MSFT)
  // Use demo only if KEY is not set, so reviewers can see *something*.
  if (!KEY) return { key: 'demo', demo: true, symbol: symbol ?? 'MSFT' };
  return { key: KEY, demo: false, symbol };
}

export async function fetchGlobalQuote(symbol: string) {
  const { key, symbol: sym } = getKeyOrDemo(symbol);
  const url = `${API_BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym!)}&apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data['Note']) throw new Error('API limit reached. Please wait and try again.');
  const q = data['Global Quote'];
  if (!q || !q['01. symbol']) throw new Error('Quote not available');

  const price = parseFloat(q['05. price']);
  const changePercentStr = q['10. change percent'] || '0%';
  const changePercent = parseFloat(changePercentStr.replace('%',''));

  return {
    symbol: q['01. symbol'],
    price,
    changePercent,
    previousClose: parseFloat(q['08. previous close'] ?? '0'),
    change: parseFloat(q['09. change'] ?? '0'),
    latestTradingDay: q['07. latest trading day'],
  };
}

export async function fetchIntradaySeries(symbol: string, interval: '5min'|'15min'|'30min' = '5min') {
  const { key, symbol: sym } = getKeyOrDemo(symbol);
  const url = `${API_BASE}?function=TIME_SERIES_INTRADAY&symbol=${encodeURIComponent(sym!)}&interval=${interval}&outputsize=compact&apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data['Note']) throw new Error('API limit reached. Please wait and try again.');
  const series = data[`Time Series (${interval})`];
  if (!series) throw new Error('Series not available');

  const points = Object.entries(series)
    .map(([ts, ohlc]: any) => ({
      t: new Date(ts),
      close: parseFloat(ohlc['4. close']),
    }))
    .sort((a,b) => a.t.getTime() - b.t.getTime());

  return points;
}
