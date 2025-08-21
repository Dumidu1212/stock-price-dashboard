export type Ticker = string;

export interface Quote {
  symbol: string;
  price: number;
  changePercent: number; // in %
  previousClose?: number;
  change?: number;
  latestTradingDay?: string;
}

export interface ApiError {
  message: string;
}
