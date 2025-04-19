import { createNewUserInDatabase, withToast } from '@/lib/utils';
import { Manager, Tenant } from '@/types/prismaTypes';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { axiosInstance } from './axios-config';

export type User = {
  cognitoInfo: any;
  userInfo: Tenant | Manager;
  userRole: string;
};

export const authQueries = {
  getAuthUser: async (): Promise<User> => {
    const session = await fetchAuthSession();
    const { idToken } = session.tokens ?? {};

    if (!idToken?.payload) {
      throw new Error(
        'No idToken or payload found. User may not be authenticated yet.',
      );
    }

    const user = await getCurrentUser();
    const userRole = idToken.payload['custom:role'] as string;

    const endpoint =
      userRole === 'manager'
        ? `/managers/${user.userId}`
        : `/tenants/${user.userId}`;

    try {
      const { data: userInfo } = await axiosInstance.get(endpoint);
      return {
        cognitoInfo: { ...user },
        userInfo,
        userRole,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Handle user creation logic here
        const response = await createNewUserInDatabase(
          user,
          idToken,
          userRole,
          async (config: any) => {
            const { data } = await axiosInstance({
              ...config,
              url: config.url,
              method: config.method || 'GET',
              data: config.body,
            });
            return data;
          },
        );
        return {
          cognitoInfo: { ...user },
          userInfo: response.data,
          userRole,
        };
      }
      throw error;
    }
  },

  updateTenantSettings: async({cognitoId, ...updatedTenant}:{cognitoId:string} & Partial<Tenant>):Promise<Tenant>=>{
    return withToast(
      axiosInstance.put(`tenants/${cognitoId}`,updatedTenant).then((res) => res.data),
      {
        success: 'Settings updated successfully!',
        error: 'Failed to update settings.',
      },
    );
  },

  updateManagerSettings: async ({cognitoId,...updatedManager}:{cognitoId:string} & Partial<Manager>):Promise<Manager>=>{
    return withToast(
      axiosInstance.put(`managers/${cognitoId}`,updatedManager).then((res) => res.data),
      {
        success: 'Settings updated successfully!',
        error: 'Failed to update settings.',
      }
    )
  },

  updateSettings: async ({
    userRole,
    cognitoId,
    ...data
  }: {
    userRole: string;
    cognitoId: string;
    [key: string]: any;
  }) => {
    const endpoint = `${userRole.toLowerCase()}s/${cognitoId}`;
    return withToast(
      axiosInstance.put(endpoint, data).then((res) => res.data),
      {
        success: 'Settings updated successfully!',
        error: 'Failed to update settings.',
      },
    );
  },
};
