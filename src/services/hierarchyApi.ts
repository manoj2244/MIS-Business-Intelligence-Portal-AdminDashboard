import { fetch, patch, store, update } from '../utils/httpUtil';

const extractPayload = (response: any): any =>
  response?.data?.data?.data ?? response?.data?.data ?? response?.data;

export const getRegions = async (): Promise<any[]> => {
  const response = await fetch('/regions');
  return extractPayload(response) || [];
};

export const getClusters = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/clusters', params);
  return extractPayload(response) || [];
};

export const getBranches = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/branches', params);
  return extractPayload(response) || [];
};

export const getMappings = async (params: Record<string, any> = {}): Promise<any[]> => {
  const response = await fetch('/mappings', params);
  const payload = extractPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const createRegion = async (payload: any): Promise<any> => {
  const response = await store('/regions', payload);
  return extractPayload(response);
};

export const createCluster = async (payload: any): Promise<any> => {
  const response = await store('/clusters', payload);
  return extractPayload(response);
};

export const createBranch = async (payload: any): Promise<any> => {
  const response = await store('/branches', payload);
  return extractPayload(response);
};

export const createBranchMapping = async (payload: any): Promise<any> => {
  const response = await store('/branch-mapping', payload);
  return extractPayload(response);
};

export const moveBranchMapping = async (branchCode: string, payload: any): Promise<any> => {
  const response = await update(`/branch-mapping/${branchCode}`, payload);
  return extractPayload(response);
};

export const editRegion = async (code: string, payload: any): Promise<any> => {
  const response = await patch(`/regions/${code}`, payload);
  return extractPayload(response);
};

export const editCluster = async (code: string, payload: any): Promise<any> => {
  const response = await patch(`/clusters/${code}`, payload);
  return extractPayload(response);
};

export const editBranch = async (code: string, payload: any): Promise<any> => {
  const response = await patch(`/branches/${code}`, payload);
  return extractPayload(response);
};

export const toggleMapping = async (payload: any): Promise<any> => {
  const response = await patch('/mappings/deactivate', payload);
  return extractPayload(response);
};

export const splitCluster = async (clusterCode: string, payload: any): Promise<any> => {
  const response = await store(`/clusters/${clusterCode}/split`, payload);
  return extractPayload(response);
};
