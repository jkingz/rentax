'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Loader = () => {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setProgress(60);
    setHidden(false);

    const timer = setTimeout(() => {
      setProgress(100);

      setTimeout(() => {
        setHidden(true);
        setProgress(0);
      }, 200);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);
  return (
    <>
      <div className="h-screen px-4 py-4  sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-t-transparent border-purple-700"></div>
            <h2 className="text-2xl font-semibold text-gray-900 ">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
