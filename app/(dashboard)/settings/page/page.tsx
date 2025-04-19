'use client';

import SettingsForm from '@/components/SettingsForm';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser, useUpdateManagerSettings, useUpdateTenantSettings } from '@/state/auth-hooks';
import { useRouter } from 'next/navigation';

const Settings = () => {
  const { data: authUser, isLoading } = useAuthUser();
  const { mutate: updateTenant, isPending: isTenantUpdating } = useUpdateTenantSettings();
  const { mutate: updateManager, isPending: isManagerUpdating } = useUpdateManagerSettings();
  const router = useRouter();

  if (isLoading) return <Spinner />;
  if (!authUser) return null;

  const userRole = authUser.userRole.toLowerCase();

  // Redirect to dashboard if invalid access
  if (!['tenant', 'manager'].includes(userRole)) {
    router.push('/');
    return null;
  }

  const initialData = {
    name: authUser.userInfo.name,
    email: authUser.userInfo.email,
    phoneNumber: authUser.userInfo.phoneNumber,
  };

  const handleSubmit = async (data: typeof initialData) => {
    const updateFn = userRole === 'tenant' ? updateTenant : updateManager;
    updateFn({
      cognitoId: authUser.cognitoInfo.userId,
      ...data,
    });
  };

  return (
    <SettingsForm
      initialData={initialData}
      onSubmit={handleSubmit}
      userType={userRole as 'tenant' | 'manager'}
      isPending={userRole === 'tenant' ? isTenantUpdating : isManagerUpdating}
    />
  );
};

export default Settings;
