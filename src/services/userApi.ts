import { fetch, store } from '../utils/httpUtil';

const baseUrl = '/user';

export const userApi = {
  searchUsers: async (payload: any): Promise<any> => {
    const response = await store(`${baseUrl}/search`, payload);
    return response?.data?.data;
  },

  addUser: async (payload: any): Promise<any> => {
    const response = await store(`${baseUrl}`, payload);
    return response?.data?.data;
  },

  getUserById: async (id: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/${id}/detail`);
    return response?.data?.data;
  },

  updateUser: async ({ id, ...payload }: { id: string; [key: string]: any }): Promise<any> => {
    const response = await store(`${baseUrl}/${id}/update`, payload);
    return response?.data?.data;
  },

  fetchUpdateRequest: async (id: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/${id}/update-request`);
    return response?.data?.data;
  },
};
