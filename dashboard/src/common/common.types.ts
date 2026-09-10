export enum ConnectionStatus {
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Disconnected = 'disconnected',
}


export type LeaderboardEntry = {
  name: string;
  total: number;
}

export type Warranty = {
  customerCompany: string;
  expirationDate: string;
  daysLeft: number;
  salesmanName: string;
  warrantyType: string;
}

export type ChartDataPoint = {
  date: string;
  salesman: string;
  cumulativeVolume: number;
  annotation?: string;
}

export type DashboardData = {
  leaderboard: LeaderboardEntry[];
  closestWarranty: Warranty | null;
  chartData: ChartDataPoint[];
}

type GenericObject<K, V> = {
  id: K;
  fieldA: string;
  fieldB: number;
  listOfGenericType: V[];
}
