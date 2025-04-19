'use client';

import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="!text-2xl !font-bold">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Rentax Logo"
              width={42}
              height={42}
              className="w-12 h-10"
            />
            RentAX
          </Link>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Welcome!</span> Please sign in to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up here
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.['custom:role']}
            hasError={!!validationErrors?.['custom:role']}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
      label: 'Email',
      isRequired: true,
    },
    password: {
      placeholder: 'Enter your password',
      label: 'Password',
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: 'Choose a username',
      label: 'Username',
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: 'Enter your email address',
      label: 'Email',
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: 'Create a password',
      label: 'Password',
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: 'Confirm your password',
      label: 'Confirm Password',
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith('/manager') || pathname.startsWith('/tenants');

  // Clear query cache on sign out
  useEffect(() => {
    if (!user) {
      queryClient.clear();
    }
  }, [user, queryClient]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage && isLoading) {
      setIsLoading(false);
      // Prefetch auth user data
      queryClient.prefetchQuery({
        queryKey: ['authUser'],
        queryFn: () =>
          import('@/state/auth-queries').then((m) =>
            m.authQueries.getAuthUser(),
          ),
      });
      router.push('/');
    }
  }, [user, isAuthPage, router, queryClient]);

  
  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage && !isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        initialState={pathname.includes('signup') ? 'signUp' : 'signIn'}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
