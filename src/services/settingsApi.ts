import { fetch, update } from '../utils/httpUtil';
import { SETTINGS_PATH } from '../constants';
import type { BankConfig } from '../stores/bankConfigStore';

export const settingsApi = {
  get: async (): Promise<BankConfig | null> => {
    const res = await fetch(SETTINGS_PATH);
    return res?.data?.data ?? res?.data ?? null;
  },

  save: async (data: Partial<BankConfig> & { bankName: string; shortName: string }): Promise<BankConfig> => {
    const res = await update(SETTINGS_PATH, data);
    return res?.data?.data ?? res?.data;
  },
};
