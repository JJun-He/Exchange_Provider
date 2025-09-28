import { AccountBalance } from './account-balance.interface';

export interface ExchangeProvider {
  setCredentials(apiKey: string, secretKey: string, dataKey?: string): void;
  getAccountBalances(): Promise<AccountBalance[]>;
}
