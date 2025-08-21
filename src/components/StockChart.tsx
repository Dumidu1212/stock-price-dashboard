import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { fetchIntradaySeries } from '../lib/api';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

export default function StockChart({ symbol }: { symbol: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ t: Date; close: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchIntradaySeries(symbol, '5min')
      .then((pts) => {
        if (mounted) setData(pts);
      })
      .catch((e: any) => setError(e.message || 'Failed to load chart'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [symbol]);

  if (loading) return <p className="text-sm text-gray-500">Loading chart...</p>;
  if (error) return <p className="text-sm text-red-600">Chart error: {error}</p>;
  if (!data.length) return <p className="text-sm text-gray-500">No chart data.</p>;

  const chartData = {
    labels: data.map(p => p.t),
    datasets: [{
      label: `${symbol} (5m)`,
      data: data.map(p => p.close),
      tension: 0.3,
      fill: true,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: 'hour' as const }
      },
      y: { beginAtZero: false }
    },
    plugins: {
      legend: { display: true }
    }
  };

  return (
    <div className="h-72 sm:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
