'use client';
import Navbar from '@/components/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import { useAuthUser } from '@/state/auth-hooks';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole.toLowerCase();
      if (
        (userRole === 'manager' && pathname.startsWith('/search')) ||
        (userRole === 'manager' && pathname === '/')
      ) {
        router.push('/managers/properties', { scroll: false });
      } else {
        setIsRedirecting(false);
      }
    } else {
      setIsRedirecting(false);
    }
  }, [authUser, router, pathname]);

  if (isLoading || isRedirecting) return <Spinner />;

  return (
    <div className="h-full w-full">
      <Navbar />
      <main
        className="h-full flex w-full flex-col"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
