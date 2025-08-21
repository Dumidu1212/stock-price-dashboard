# Stock Price Dashboard

A simple stock price dashboard built with **React + TypeScript + Tailwind CSS** and the **Alpha Vantage** free API.

## Features
- Fetch and display stock data in a responsive table (symbol, price, change %).
- Loading states and error handling.
- Search/add tickers (persisted in localStorage).
- Sort by price and change %.
- Optional chart (intraday) for a selected stock using Chart.js.

## Quick Start
```bash
npm i
cp .env.example .env   # put your Alpha Vantage API key
npm run dev
```

### Deploy
- **Vercel**: Import the repo, set `VITE_ALPHA_VANTAGE_KEY` in Project → Settings → Environment Variables, then Deploy.
- **Netlify**: New site from Git, add env var, build command `npm run build`, publish dir `dist`.
- **GitHub Pages**: Use `vite` + any action to publish `/dist` (you must provide env var at build time).

## Notes
- Free Alpha Vantage has 5 requests/min limit. The app defaults to 4 tickers to stay within limits.
- If no API key is provided, it will fall back to Alpha Vantage's public demo for **MSFT** (limited data).
