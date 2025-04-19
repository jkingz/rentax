'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NotFound = () => {
  return (
    <>
      <div className="h-screen px-4 py-4  sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <div className="flex mt-6">
            <p className="text-4xl font-extrabold text-blue600 sm:text-5xl">
              Ooppps!!!
            </p>
            <div className="ml-6">
              <div className="pl-6 border-l border-gray500">
                <h2 className="text-3xl font-bold tracking-tight text-gray900 dark:text-white sm:text-4xl">
                  Something went wrong!
                </h2>
                <p className="mt-1 text-lg text-gray500 dark:text-white">
                  Please select go back home button to continue.
                </p>
              </div>
              <div className="flex mt-10 space-x-3 sm:pl-6">
                <Link href="/">
                  <Button
                    variant="secondary"
                    className="text-white bg-pink-600 hover:bg-black hover:text-white rounded-lg"
                  >
                    Go Back Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
