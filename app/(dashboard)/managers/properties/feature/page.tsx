'use client';

import Card from '@/components/Card';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from '@/state/api';
import { appConsole } from '@/utils/console';
import { useEffect } from 'react';

const Properties = () => {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const cognitoId = authUser?.cognitoInfo?.userId || '';

  const {
    data: managerProperties,
    isLoading: isPropertiesLoading,
    error,
    refetch
  } = useGetManagerPropertiesQuery(cognitoId, {
    skip: !cognitoId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      appConsole.group('Properties Component Debug', () => {
        appConsole.info('Auth User ID:', cognitoId);
        appConsole.info('Is Loading:', isPropertiesLoading);
        appConsole.info('Raw Manager Properties:', managerProperties);
        // appConsole.table(managerProperties || []);
        if (error) {
          appConsole.error('Error occurred:', error);
        }
      });
    }

    // Only refetch if we have a cognitoId and no data yet
    if (cognitoId && !managerProperties) {
      appConsole.info('Triggering refetch...');
      refetch();
    }
  }, [error, cognitoId, managerProperties, isPropertiesLoading, refetch]);

  const isLoading = isAuthLoading || isPropertiesLoading;

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading manager properties: {JSON.stringify(error)}</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="My Properties"
        subtitle="View and manage your property listings"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managerProperties && managerProperties.length > 0 ? (
          managerProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={false}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/managers/properties/${property.id}`}
            />
          ))
        ) : (
          <p className="col-span-full text-center py-8">You don&apos;t manage any properties yet</p>
        )}
      </div>
    </div>
  );
};

export default Properties;
