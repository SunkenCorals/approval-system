import request from './request';
import { ApprovalListItem, ApprovalDetail, FormConfigField, DepartmentTreeNode } from '../types';

// Helper to cast AxiosResponse to actual data T (since interceptor handles it)
const get = <T>(url: string, config?: any) => request.get(url, config) as unknown as Promise<T>;
const post = <T>(url: string, data?: any, config?: any) => request.post(url, data, config) as unknown as Promise<T>;
const put = <T>(url: string, data?: any) => request.put(url, data) as unknown as Promise<T>;

export const approvalApi = {
  getList: (params: any) => {
    return get<{ list: ApprovalListItem[]; total: number }>('/approvals', { params });
  },
  getDetail: (id: number) => {
    return get<ApprovalDetail>(`/approvals/${id}`);
  },
  create: (data: any) => {
    return post<{ id: number }>('/approvals', data);
  },
  update: (id: number, data: any) => {
    return put<{ id: number }>(`/approvals/${id}`, data);
  },
  withdraw: (id: number) => {
    return post<void>(`/approvals/${id}/withdraw`);
  },
  approve: (id: number) => {
    return post<void>(`/approvals/${id}/approve`);
  },
  reject: (id: number, reason: string) => {
    return post<void>(`/approvals/${id}/reject`, { reason });
  },
  upload: (id: number, formData: FormData) => {
    return post<any>(`/approvals/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFormConfig: (key: string) => {
    return get<FormConfigField[]>(`/form-configs/${key}`);
  },
  getDepartments: () => {
    return get<DepartmentTreeNode[]>('/departments');
  },
};
