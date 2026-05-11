import { destroy, fetch, patch, store } from '../utils/httpUtil';

const extractPayload = (response: any): any =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data;

export const getLoanSegments = async (params: Record<string, any> = {}): Promise<any> => {
  const response = await fetch('/loan-management/segments', params);
  const payload = extractPayload(response);
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: { page: 1, pageSize: payload.length, total: payload.length, totalPages: payload.length > 0 ? 1 : 0 },
    };
  }
  return payload || { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };
};

export const getLoanAcTypes = async (): Promise<any[]> => {
  const response = await fetch('/loan-management/actypes');
  return extractPayload(response) || [];
};

export const createLoanSegment = async (payload: any): Promise<any> => {
  const response = await store('/loan-management/segments', payload);
  return extractPayload(response);
};

export const updateLoanSegment = async (id: number, payload: any): Promise<any> => {
  const response = await patch(`/loan-management/segments/${id}`, payload);
  return extractPayload(response);
};

export const deleteLoanSegment = async (id: number): Promise<any> => {
  const response = await destroy(`/loan-management/segments/${id}`);
  return extractPayload(response);
};
