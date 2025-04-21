import { cleanParams, createNewUserInDatabase, withToast } from '@/lib/utils';
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant,
} from '@/types/prismaTypes';
import { appConsole } from '@/utils/console';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { FiltersState } from '.';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  reducerPath: 'api',
  tagTypes: [
    'Managers',
    'Tenants',
    'Properties',
    'PropertyDetails',
    'Leases',
    'Payments',
    'Applications',
    'AuthUser',
  ],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          if (!idToken || !idToken.payload) {
            return {
              error:
                'No idToken or payload found. User may not be authenticated yet.',
            };
          }
          const user = await getCurrentUser();
          const userRole = idToken?.payload['custom:role'] as string;

          const endpoint =
            userRole === 'manager'
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ({ url: endpoint });

          //check if user exists, create if not
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ,
            );
          }

          //create user if doesn't exist
          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            } as User,
          };
        } catch (error: any) {
          return { error: error.message || 'Something went wrong' };
        }
      },
      providesTags: ['AuthUser'],
    }),

    // tenant related endpoints
    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => ({
        url: `tenants/${cognitoId}`,
        // Add error handling for 404
        validateStatus: (response, result) =>
          response.status === 200 || response.status === 404,
      }),
      transformResponse: (response: any) => {
        if (!response) return null;
        return response;
      },
      providesTags: (result) => [{ type: 'Tenants', id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load tenant profile.',
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `tenants/${cognitoId}/current-residences`,
      transformResponse: (response: any) => {
        // Ensure we're returning an array, even if empty
        return Array.isArray(response) ? response.filter(Boolean) : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result
                .filter(Boolean)
                .map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' },
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch current residences.',
        });
      },
    }),

    // tenant related endpoints
    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: 'PUT',
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [
        { type: 'Tenants', id: result?.id },
        'AuthUser',
        'Tenants',
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Settings updated successfully!',
          error: 'Failed to update settings.',
        });
      },
    }),

    // manager related endpoints
    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `managers/${cognitoId}/properties`,
      transformResponse: (response: any) => {
        // Ensure we're returning an array, even if empty
        return Array.isArray(response) ? response : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' },
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load properties.',
        });
      },
    }),

    // manager related endpoints
    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: 'PUT',
        body: updatedManager,
      }),
      invalidatesTags: (result) => [
        { type: 'Managers', id: result?.id },
        'AuthUser',
        'Managers',
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Settings updated successfully!',
          error: 'Failed to update settings.',
        });
      },
    }),

    // get property
    getProperty: build.query<Property, number>({
      query: (id) => ({
        url: `properties/${id}`,
        // Add error handling for 404
        validateStatus: (response, result) =>
          response.status === 200 || response.status === 404,
      }),
      transformResponse: (response: any) => {
        if (!response) return null;
        return response;
      },
      providesTags: (result) => [{ type: 'PropertyDetails', id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to load property details.',
        });
      },
    }),

    // property related endpoints
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(','),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(','),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: 'properties', params };
      },
      transformResponse: (response: any) => {
        // Always return an array, even if response is null/undefined/not an array
        return Array.isArray(response) ? response : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' },
            ]
          : [{ type: 'Properties', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch properties.',
        });
      },
    }),

    // favorite property related endpoints
    addFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: 'POST',
      }),
      invalidatesTags: (result) => [
        { type: 'Tenants', id: result?.id },
        { type: 'Properties', id: 'LIST' },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Added to favorites!!',
          error: 'Failed to add to favorites',
        });
      },
    }),

    // remove favorite property related endpoints
    removeFavoriteProperty: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `tenants/${cognitoId}/favorites/${propertyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result) => [
        { type: 'Tenants', id: result?.id },
        { type: 'Properties', id: 'LIST' },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Removed from favorites!',
          error: 'Failed to remove from favorites.',
        });
      },
    }),

    // create property
    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: 'POST',
        body: newProperty,
      }),
      invalidatesTags: (result, error, arg) => {
        // Get the manager ID from the form data
        const managerCognitoId = arg.get('managerCognitoId') as string;
        return [
          { type: 'Properties', id: 'LIST' },
          { type: 'Properties', id: result?.id },
          { type: 'Managers', id: managerCognitoId }, // Use the cognitoId directly
          'AuthUser',
        ];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Property created successfully!',
          error: 'Failed to create property.',
        });
      },
    }),

    // lease related enpoints
    getLeases: build.query<Lease[], number>({
      query: () => 'leases',
      providesTags: ['Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch leases.',
        });
      },
    }),

    //
    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `leases?propertyId=${propertyId}`,
      providesTags: ['Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch property leases.',
        });
      },
    }),

    // get payments
    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ['Payments'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch payment info.',
        });
      },
    }),

    // application related endpoints
    getApplications: build.query<
      Application[],
      { userId?: string; userType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append('userId', params.userId.toString());
        }
        if (params.userType) {
          queryParams.append('userType', params.userType);
        }

        return `applications?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        // Ensure we're returning an array, even if empty
        appConsole.info('response', response);
        return Array.isArray(response) ? response : [];
      },
      providesTags: ['Applications'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: 'Failed to fetch applications.',
        });
      },
    }),

    // create application
    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Applications'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Application created successfully!',
          error: 'Failed to create applications.',
        });
      },
    }),

    // update application status
    updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Applications', 'Leases'],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: 'Application status updated successfully!',
          error: 'Failed to update application settings.',
        });
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
} = api;
