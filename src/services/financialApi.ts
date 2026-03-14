import { destroy, fetch, patch, store } from '../utils/httpUtil';

const extractPayload = (response: any): any =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data;

export const getFinancialAccountTree = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/financial-reporting/accounts/tree', params);
  return extractPayload(response) || [];
};

export const getFinancialAccounts = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/financial-reporting/accounts', params);
  return extractPayload(response) || [];
};

export const getFinancialAccountNode = async (accountCode: string): Promise<any> => {
  const response = await fetch(`/financial-reporting/accounts/${accountCode}`);
  return extractPayload(response);
};

export const createFinancialRoot = async (payload: any): Promise<any> => {
  const response = await store('/financial-reporting/accounts/root', payload);
  return extractPayload(response);
};

export const createFinancialChild = async (parentCode: string, payload: any): Promise<any> => {
  const response = await store(`/financial-reporting/accounts/${parentCode}/children`, payload);
  return extractPayload(response);
};

export const updateFinancialAccount = async (accountCode: string, payload: any): Promise<any> => {
  const response = await patch(`/financial-reporting/accounts/${accountCode}`, payload);
  return extractPayload(response);
};

export const deleteFinancialAccount = async (accountCode: string): Promise<any> => {
  const response = await destroy(`/financial-reporting/accounts/${accountCode}`);
  return extractPayload(response);
};

export const getCoreFtbAccounts = async (params: Record<string, any> = {}): Promise<any> => {
  const response = await fetch('/financial-reporting/core-accounts', params);
  const payload = extractPayload(response);
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: { page: 1, pageSize: payload.length, total: payload.length, totalPages: payload.length > 0 ? 1 : 0 },
    };
  }
  return payload || { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
};

export const getFtbMappings = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/financial-reporting/mappings', params);
  return extractPayload(response) || [];
};

export const createFtbMapping = async (payload: any): Promise<any> => {
  const response = await store('/financial-reporting/mappings', payload);
  return extractPayload(response);
};

export const updateFtbMapping = async (mainCode: string, payload: any): Promise<any> => {
  const response = await patch(`/financial-reporting/mappings/${mainCode}`, payload);
  return extractPayload(response);
};

export const toggleFtbMappingStatus = async (mainCode: string, payload: any): Promise<any> => {
  const response = await patch(`/financial-reporting/mappings/${mainCode}/status`, payload);
  return extractPayload(response);
};
