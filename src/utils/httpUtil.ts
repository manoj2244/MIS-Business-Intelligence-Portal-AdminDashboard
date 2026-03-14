import { httpBaseUtils, httpBaseUploadUtils } from './httpBaseUtil';
import type { AxiosResponse } from 'axios';

function resolveEndpoint(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  if (endpoint.startsWith('/')) {
    return endpoint;
  }

  return `/${endpoint}`;
}

export function fetch<T = any>(
  endpoint: string,
  params?: any,
  headers?: any
): Promise<AxiosResponse<T>> {
  return httpBaseUtils().get(resolveEndpoint(endpoint), { params, headers });
}

export function store<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils().post(resolveEndpoint(endpoint), data);
}

export function update<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils().put(resolveEndpoint(endpoint), data);
}

export function patch<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils().patch(resolveEndpoint(endpoint), data);
}

export function destroy<T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils().delete(resolveEndpoint(endpoint), { data });
}

export function download<T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils(true).get(resolveEndpoint(endpoint), { params });
}

export function downloadFile<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return httpBaseUtils(true).post(resolveEndpoint(endpoint), data);
}

export function uploadFile<T = any>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return httpBaseUploadUtils().post(resolveEndpoint(endpoint), data);
}
