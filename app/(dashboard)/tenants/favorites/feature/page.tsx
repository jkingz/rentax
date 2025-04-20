'use client';

import Card from '@/components/Card';
import Header from '@/components/Header';
import Loading from '@/components/Loading';
import { useAuthUser } from '@/state/auth-hooks';
import { useProperties } from '@/state/property-hooks';
import { useTenant } from '@/state/tenant-hooks';

const Favorites = () => {
  const { data: authUser } = useAuthUser();
  const { data: tenant, isLoading: tenantLoading } = useTenant(
    authUser?.cognitoInfo?.userId || '',
  );
  const { data: favoriteProperties, isLoading: propertiesLoading } =
    useProperties({
      favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id),
    });

  if (tenantLoading || propertiesLoading) return <Loading />;

  return (
    <div className="dashboard-container">
      <Header
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteProperties?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={true}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!favoriteProperties || favoriteProperties.length === 0) && (
        <p>You don&lsquo;t have any favorited properties</p>
      )}
    </div>
  );
};

export default Favorites;
