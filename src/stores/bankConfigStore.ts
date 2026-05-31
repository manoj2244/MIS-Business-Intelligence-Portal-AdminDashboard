import { create } from 'zustand';

export interface BankConfig {
  bankName: string;
  shortName: string;
  currencyCode: string;
  currencySymbol: string;
  primaryColor: string;
  moneyScale: string;
  supportEmail?: string | null;
  logoBase64?: string | null;
  faviconBase64?: string | null;
}

interface BankConfigState {
  config: BankConfig | null;
  loaded: boolean;
  setConfig: (config: BankConfig) => void;
}

const DEFAULTS: BankConfig = {
  bankName: 'MIS Portal',
  shortName: 'MIS',
  currencyCode: 'NPR',
  currencySymbol: 'Rs.',
  primaryColor: '#1d4ed8',
  moneyScale: 'CRORE',
};

export const useBankConfigStore = create<BankConfigState>((set) => ({
  config: null,
  loaded: false,
  setConfig: (config) => set({ config, loaded: true }),
}));

export const getBankConfig = (): BankConfig => {
  return useBankConfigStore.getState().config ?? DEFAULTS;
};
