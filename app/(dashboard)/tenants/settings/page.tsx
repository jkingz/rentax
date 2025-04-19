'use client';

import SettingsForm from '@/components/SettingsForm';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser, useUpdateTenantSettings } from '@/state/auth-hooks';

const TenantSettings = () => {
  const { data: authUser, isLoading } = useAuthUser();
  const { mutate: updateTenant, isPending } = useUpdateTenantSettings();

  if (isLoading) return <Spinner />;

  if (!authUser) return null;

  const initialData = {
    name: authUser.userInfo.name,
    email: authUser.userInfo.email,
    phoneNumber: authUser.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    updateTenant({
      cognitoId: authUser.cognitoInfo.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType="tenant"
      isPending={isPending}
    />
  );
};

export default TenantSettings;
