'use client';

import { NAVBAR_HEIGHT } from '@/lib/constants';
import { useAuthUser } from '@/state/auth-hooks';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from 'aws-amplify/auth';
import { Bell, MessageCircle, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarTrigger } from './ui/sidebar';
import { Spinner } from './ui/spinner';

const Navbar = () => {
  const { data: authUser, isLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardPage =
    pathname.includes('/managers') || pathname.includes('/tenants');

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear(); // Clear query cache on sign out
    router.push('/');
  };

  if (isLoading) return <Spinner />;
  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full py-3 px-8 bg-gray-700 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboardPage && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link
            href="/"
            className="cursor-pointer hover:!text-gray-300"
            scroll={false}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo.webp"
                alt="Rentax Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="text-xl font-bold">
                RentA
                <span className="text-pink-500 font-light hover:!text-gray-300">
                  X
                </span>
              </div>
            </div>
          </Link>
          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-gray-50 text-gray-700 hover:bg-pink-500 hover:text-gray-50"
              onClick={() =>
                router.push(
                  authUser.userRole?.toLowerCase() === 'manager'
                    ? '/managers/newproperty/feature'
                    : '/search',
                )
              }
            >
              {authUser.userRole?.toLowerCase() === 'manager' ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:block ml-2">Add New Property</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden md:block ml-2">
                    Search Properties
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
        {!isDashboardPage && (
          <p className="text-gray-200 hidden md:block">
            Discover your perfect rental apartment with our advanced search
          </p>
        )}
        <div className="flex items-center gap-5">
          {authUser ? (
            <>
              <div className="relative hidden md:block">
                <MessageCircle className="w-6 h-6 cursor-pointer text-gray-200 hover:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-700 rounded-full"></span>
              </div>
              <div className="relative hidden md:block">
                <Bell className="w-6 h-6 cursor-pointer text-gray-200 hover:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-700 rounded-full"></span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src={authUser.userInfo?.image} />
                    <AvatarFallback className="bg-gray-600">
                      {authUser.userRole?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-gray-200 hidden md:block">
                    {authUser.userInfo?.name}
                  </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-700">
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-gray-700 hover:!text-gray-100 font-bold"
                    onClick={() =>
                      router.push(
                        authUser.userRole?.toLowerCase() === 'manager'
                          ? '/managers/properties/feature'
                          : '/tenants/favorites/feature',
                        { scroll: false },
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-gray-700 hover:!text-gray-100"
                    onClick={() =>
                      router.push('/settings/page', { scroll: false })
                    }
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-gray-700 hover:!text-gray-100"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="text-white border-white bg-transparent hover:bg-white hover:text-gray-700 rounded-lg"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="text-white bg-pink-600 hover:bg-white hover:text-gray-700 rounded-lg"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
