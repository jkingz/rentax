import { withToast } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchTenant } from './tenant-queries';
import { Tenant } from '@/types/prismaTypes';


export const useTenant = (cognitoId: string) => {
  return useQuery<Tenant>({
    queryKey: ['tenant', cognitoId],
    queryFn: () => fetchTenant(cognitoId),
    enabled: Boolean(cognitoId),
    select: (tenant) => tenant,
  });
};
