'use client';

import StoreProvider from '@/state/redux';
import { Authenticator } from '@aws-amplify/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Amplify } from 'aws-amplify';
import { useRef } from 'react';
import Auth from './(auth)/authProvider';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClientRef = useRef<QueryClient | null>(null);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }

  return (
    //{/* Wrap children with QueryClientProvider for React Query server-side */}
    <QueryClientProvider client={queryClientRef.current}>
      {/* Wrap children with StoreProvider Redux for client-side state  */}
      <StoreProvider>
        <Authenticator.Provider>
          <Auth>{children}</Auth>
        </Authenticator.Provider>
      </StoreProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
