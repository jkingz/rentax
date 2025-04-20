import { withToast } from '@/lib/utils';
import { Tenant } from '@/types/prismaTypes';
import { axiosInstance } from './axios-config';


export const fetchTenant = async (cognitoId: string): Promise<Tenant> => {
  if (!cognitoId) return null;
  const { data } = await axiosInstance.get(`/tenants/${cognitoId}`);
  return data;
};
